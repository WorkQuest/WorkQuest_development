<template>
  <div class="collateral">
    <div class="collateral__title">
      {{ $t('wallet.collateral.balance') }}
    </div>
    <div
      v-if="collateralsCount"
      class="collateral__content"
    >
      <div class="collateral__header table_grid">
        <div>{{ $t('wallet.collateral.collateralToken') }}</div>
        <div>{{ $t('wallet.collateral.lockedAmount') }}</div>
        <div>{{ $t('wallet.collateral.generatedAmount') }}</div>
        <div>{{ $t('meta.price') }}</div>
        <div>{{ $t('wallet.collateral.ratio') }}</div>
      </div>
      <div
        v-for="(item, i) of collaterals"
        :key="i"
        class="collateral__item item"
        :class="[
          {item_full: i === idxHistory},
          ...getRiskClass(item),
        ]"
      >
        <div
          class="item__wrapper table_grid"
          @click.stop="toggleHistory(i, item)"
        >
          <div class="item__coin">
            <img
              :src="getCollateralIcon(item.symbol)"
              alt=""
              class="item__coin-icon"
            >
            {{ item.symbol }}
          </div>
          <div>{{ item.lockedAmount }}</div>
          <div>{{ item.wusdGenerated }}</div>
          <div>{{ item._price }}</div>
          <div>{{ item.colRatio }}</div>
          <div
            class="item__caret"
            @click.stop="toggleHistory(i, item)"
          >
            <span :class="{'icon-caret_down': i !== idxHistory, 'icon-caret_up': i === idxHistory}" />
          </div>
        </div>
        <div
          v-show="i === idxHistory"
          class="item__history"
        >
          <div class="item__actions">
            <base-btn
              class="item__btn"
              data-selector="GENERATE"
              :disabled="!isAvailableToClaim"
              @click.stop="handleGenerate(item)"
            >
              {{ $t('meta.btns.generate') }}
            </base-btn>
            <base-btn
              class="item__btn"
              data-selector="DEPOSIT"
              :disabled="!isAvailableToDeposit"
              @click.stop="handleDeposit(item)"
            >
              {{ $t('meta.deposit') }}
            </base-btn>
            <base-btn
              class="item__btn"
              data-selector="REVERT"
              :disabled="!isAvailableToRemove"
              @click.stop="handleCollateralAction(item, CollateralMethods.removeCollateral)"
            >
              {{ $t('meta.btns.remove') }}
            </base-btn>
          </div>
          <div class="history__wrapper">
            <div class="history__header history__table">
              <div>{{ $t('meta.type') }}</div>
              <div>{{ $t('wallet.collateral.lockedAmount') }}</div>
              <div>{{ $t('wallet.collateral.generatedAmount') }}</div>
              <div>{{ $t('meta.price') }}</div>
              <div>{{ $t('wallet.table.txHash') }}</div>
              <div>{{ $t('wallet.collateral.generationTime') }}</div>
            </div>
            <div
              v-for="(row, j) of history"
              :key="`row-${j}`"
              class="history__row history__table"
            >
              <div>{{ movedEventStatus[row.status] }}</div>
              <div>{{ row.lockedAmount }}</div>
              <div>{{ row.wusdGenerated }}</div>
              <div>{{ row._price }}</div>
              <a
                class="item__hash"
                :href="`${$options.ExplorerUrl}/tx/${row.transactionHash}`"
                target="_blank"
              >
                {{ CutTxn( row.transactionHash) }}
              </a>
              <div>{{ $moment(row.timestamp * 1000).format('MMMM Do YYYY, hh:mm a') }}</div>
            </div>
            <!--            <base-pager-->
            <!--              v-if="totalHistoryPages > 1"-->
            <!--              :value="historyParams.page"-->
            <!--              :total-pages="totalHistoryPages"-->
            <!--              class="history__pages"-->
            <!--            />-->
          </div>
        </div>
      </div>
    </div>
    <empty-data
      v-else
      :description="$tc('meta.listIsEmpty')"
      class="table__empty"
    />
    <base-pager
      v-if="totalPages > 1"
      v-model="page"
      :total-pages="totalPages"
      class="table__pages"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import modals from '~/store/modals/modals';
import { images } from '~/utils/images';
import { TokenSymbols, ExplorerUrl, TokenMap } from '~/utils/enums';
import { WQRouter } from '~/abi';
import { getGasPrice } from '~/utils/wallet';
import ENV from '~/utils/addresses';
import walletOperations from '~/plugins/mixins/walletOperations';
import { COLLATERAL_CARDS_LIMIT, COLLATERAL_HISTORY_LIMIT, CollateralMethods } from '~/utils/сonstants/auction';

export default {
  name: 'CollateralTable',
  images,
  ExplorerUrl,
  mixins: [walletOperations],
  data() {
    return {
      CollateralMethods,
      idxHistory: null,
      availableToClaim: null,
      isAvailableToClaim: false,
      availableToDepositWUSD: null,
      isAvailableToDeposit: false,
      availableToAddCollateral: null,
      isAvailableToAddCollateral: false,
      isAvailableToRemove: true,
      historyParams: {
        page: 1,
        limit: COLLATERAL_HISTORY_LIMIT,
        offset: 0,
        count: 5,
      },
      page: 1,
    };
  },
  computed: {
    ...mapGetters({
      prices: 'oracle/getPrices',
      symbols: 'oracle/getSymbols',

      collaterals: 'collateral/getCollaterals',
      collateralsCount: 'collateral/getCollateralsCount',
      collateralPage: 'collateral/getCollateralCurrentPage',
      history: 'collateral/getHistoryCollateral',
      historyCount: 'collateral/getHistoryCollateralCount',

      walletAddress: 'user/getUserWalletAddress',
    }),
    movedEventStatus() {
      return {
        '-1': 'Removed',
        0: 'Generated',
        1: 'Burn',
        2: 'Deposit',
        3: 'LotLiquid',
        4: 'Produced',
      };
    },
    totalPages() {
      return Math.ceil(this.collateralsCount / COLLATERAL_CARDS_LIMIT) || 0;
    },
    totalHistoryPages() {
      return Math.ceil(this.historyCount / COLLATERAL_HISTORY_LIMIT) || 0;
    },
  },
  watch: {
    async page() {
      this.idxHistory = null;
      this.$store.commit('collateral/setCollateralCurrentPage', this.page);
      await this.fetchCollaterals({
        address: this.walletAddress,
        params: { limit: COLLATERAL_CARDS_LIMIT, offset: (this.page - 1) * COLLATERAL_CARDS_LIMIT },
      });
    },
  },
  async mounted() {
    await Promise.all([
      this.fetchCollaterals({
        address: this.walletAddress,
        params: { limit: COLLATERAL_CARDS_LIMIT, offset: 0 },
      }),
      this.initWS(),
    ]);
  },
  async beforeDestroy() {
    await this.destroyWS();
    this.$store.commit('collateral/setCollateralCurrentPage', 1);
  },
  methods: {
    ...mapActions({
      setCallbackWS: 'collateral/setCallbackWS',
      collateralAction: 'collateral/collateralAction',
      fetchCollaterals: 'collateral/fetchCollaterals',
      initWS: 'collateral/subscribeCollateralBalance',
      destroyWS: 'collateral/unsubscribeCollateralBalance',
      fetchCollateralInfo: 'collateral/fetchCollateralInfo',

      updatePrices: 'oracle/getCurrentTokensPrices',
    }),
    getRiskClass({ liquidityValue, depositStatus }) {
      if (depositStatus === 1 && liquidityValue > 0) return ['risk_high'];

      return [
        { risk_medium: liquidityValue && depositStatus === 0 },
        // { risk_low: liquidityValue && depositStatus === 0 },
      ];
    },
    getCollateralIcon(symbol) {
      if (TokenSymbols.ETH === symbol) return images.ETH_BLACK;
      return images[symbol] || images.EMPTY_LOGO;
    },
    async toggleHistory(idx, item) {
      if (this.idxHistory === idx) {
        this.idxHistory = null;
        this.$store.commit('collateral/setHistoryCollateral', { rows: [], count: null });
      } else {
        this.SetLoader(true);
        await Promise.all([
          this.checkActionsPossibilities(item),
          this.fetchCollateralInfo({
            address: this.walletAddress,
            collateralId: item.id,
            params: {},
          }),
        ]);

        setTimeout(() => {
          this.idxHistory = idx;
          this.SetLoader(false);
        }, 300);
      }
    },

    async checkActionsPossibilities({
      symbol, collateral, price, deposit, lockedAmount,
    }) {
      if (new BigNumber(lockedAmount).isEqualTo(0)) {
        this.isAvailableToClaim = false;
        this.isAvailableToDeposit = false;
        this.isAvailableToRemove = false;
        return;
      }

      await this.updatePrices();
      const oraclePrice = this.prices[this.symbols.indexOf(symbol)];
      if ([TokenSymbols.USDT, TokenSymbols.USDC].includes(symbol)) {
        collateral = new BigNumber(collateral).shiftedBy(12).toString();
      }

      // available for claimExtraDebt
      this.availableToClaim = new BigNumber(oraclePrice).minus(price)
        .multipliedBy(collateral)
        .dividedBy(deposit)
        .shiftedBy(-18)
        .toNumber();
      this.isAvailableToClaim = new BigNumber(this.availableToClaim).isGreaterThan(0);

      // available for disposeDebt
      this.availableToDepositWUSD = new BigNumber(price).minus(oraclePrice)
        .multipliedBy(collateral)
        .dividedBy(deposit)
        .shiftedBy(-18)
        .toNumber();
      this.isAvailableToDepositWUSD = new BigNumber(this.availableToDepositWUSD).isGreaterThan(0);

      // available for addCollateral
      this.availableToAddCollateral = new BigNumber(price)
        .multipliedBy(collateral)
        .dividedBy(oraclePrice)
        .minus(collateral)
        .shiftedBy(-18)
        .toNumber();
      this.isAvailableToAddCollateral = new BigNumber(this.availableToAddCollateral).isGreaterThan(0);
      this.isAvailableToDeposit = this.isAvailableToDepositWUSD || this.isAvailableToAddCollateral;

      this.isAvailableToRemove = true;
    },

    async handleGenerate(item) {
      if (!this.isAvailableToClaim) return;

      this.ShowModal({
        key: modals.status,
        title: this.$t('meta.btns.generate'),
        subtitle: this.$t('wallet.collateral.attentionInfoRise'),
        isNotClose: true,
        submitMethod: async () => await this.handleCollateralAction(item, CollateralMethods.claimExtraDebt),
      });
    },

    async handleDeposit(item) {
      if (!this.isAvailableToDeposit) return;
      const mode = this.isAvailableToDepositWUSD ? CollateralMethods.disposeDebt : CollateralMethods.addCollateral;

      this.ShowModal({
        key: modals.status,
        title: this.$t('meta.attention'),
        subtitle: this.$t('wallet.collateral.attentionInfoFalling'),
        isNotClose: true,
        submitMethod: async () => await this.handleCollateralAction(item, mode),
      });
    },

    async handleCollateralAction({
      index, symbol, lockedAmount, debt,
    }, mode) {
      if (!this.isAvailableToRemove) return;

      const updatePrices = async (method, payload) => {
        await new Promise(async (resolve, reject) => {
          this.SetLoader(true);
          const [feeSetPricesRes, needUpdateRes] = await Promise.all([
            this.$store.dispatch('oracle/feeSetTokensPrices'),
            getGasPrice(
              WQRouter,
              ENV.WORKNET_ROUTER,
              method,
              [...payload],
            ),
          ]);
          this.SetLoader(false);

          // Check if no need to update oracle prices
          if (needUpdateRes.gasPrice) {
            resolve();
            return;
          }

          if (!feeSetPricesRes.ok) {
            this.ShowToast(feeSetPricesRes.msg);
            reject();
            return;
          }

          const { gas, gasPrice } = feeSetPricesRes.result;
          this.ShowModal({
            key: modals.transactionReceipt,
            title: 'Update oracle prices',
            fields: {
              from: {
                name: this.$t('meta.fromBig'),
                value: this.convertToBech32('wq', this.walletAddress),
              },
              to: {
                name: this.$t('meta.toBig'),
                value: ENV.WORKNET_ORACLE,
              },
              fee: {
                name: this.$t('wallet.table.trxFee'),
                value: new BigNumber(gas).multipliedBy(gasPrice).shiftedBy(-18).toString(),
                symbol: TokenSymbols.WQT,
              },
            },
            submitMethod: async () => {
              this.SetLoader({ isLoading: true });
              const res = await this.$store.dispatch('oracle/setCurrentPriceTokens');
              if (res.ok) resolve();
              else {
                reject();
                this.ShowModalFail({ subtitle: res.msg });
              }
              this.SetLoader(false);
            },
          });
        });
      };

      const sendTx = async (method, payload, amount) => {
        await new Promise(async (resolve, reject) => {
          this.SetLoader(true);
          const { gasPrice, gas, msg } = await getGasPrice(
            WQRouter,
            ENV.WORKNET_ROUTER,
            method,
            [...payload],
          );
          this.SetLoader(false);

          if (!gas || !gasPrice) {
            this.ShowToast(msg.includes('Lot not found') ? 'Lot not found' : msg);
            reject();
            return;
          }

          const fields = {
            from: {
              name: this.$t('meta.fromBig'),
              value: this.convertToBech32('wq', this.walletAddress),
            },
            to: {
              name: this.$t('meta.toBig'),
              value: ENV.WORKNET_ROUTER,
            },
          };
          if (method !== CollateralMethods.claimExtraDebt) {
            fields.amount = {
              name: this.$t('modals.amount'),
              value: amount,
              symbol: method === CollateralMethods.addCollateral ? symbol : TokenSymbols.WUSD,
            };
          }
          fields.fee = {
            name: this.$t('wallet.table.trxFee'),
            value: new BigNumber(gas).multipliedBy(gasPrice).shiftedBy(-18).toString(),
            symbol: TokenSymbols.WQT,
          };
          const title = {
            disposeDebt: this.$t('meta.deposit'),
            addCollateral: this.$t('meta.deposit'),
            claimExtraDebt: this.$t('meta.btns.generate'),
            removeCollateral: this.$t('wallet.collateral.removeCollateral'),
          }[method];

          this.ShowModal({
            key: modals.transactionReceipt,
            title,
            fields,
            isDontOffLoader: true,
            submitMethod: async () => {
              this.SetLoader({ isLoading: true });
              const { ok, result } = await this.collateralAction({ method, payload });

              if (!ok) {
                reject();
                this.SetLoader(false);
                this.ShowModalFail({});

                return;
              }

              await this.setCallbackWS(() => {
                resolve();

                if (method === CollateralMethods.addCollateral) this.isAvailableToDeposit = false;
                else if (method === CollateralMethods.disposeDebt) this.isAvailableToDeposit = false;
                else if (method === CollateralMethods.claimExtraDebt) this.isAvailableToClaim = false;
                else if (method === CollateralMethods.removeCollateral) {
                  this.isAvailableToClaim = false;
                  this.isAvailableToRemove = false;
                  this.isAvailableToDeposit = false;
                }

                this.SetLoader(false);
                this.ShowModalSuccess({ link: `${ExplorerUrl}/tx/${result.transactionHash}` });
              });
            },
          });
        });
      };

      this.ShowModal({
        key: modals.collateralTransaction,
        mode,
        symbol,
        lockedAmount,
        availableToClaim: this.availableToClaim,
        availableToDepositWUSD: this.availableToDepositWUSD,
        availableToDepositCollateral: this.availableToAddCollateral,
        amountToRemoveCollateral: new BigNumber(debt).shiftedBy(-18).toString(),
        submit: async (method) => {
          // Payload formation
          const payload = [index, symbol];
          const amount = new BigNumber(debt).shiftedBy(-18).toString();
          let tokenAddress = ENV.WORKNET_WUSD_TOKEN;
          let amountToApprove = amount;
          if (method === CollateralMethods.addCollateral) {
            tokenAddress = TokenMap[symbol];
            amountToApprove = this.availableToAddCollateral;
          } else if (method === CollateralMethods.disposeDebt) {
            amountToApprove = this.availableToDepositWUSD;
          }

          const makeTx = async () => {
            // Update token prices if it needs then check allowance & send tx
            await updatePrices(method, payload).then(async () => {
              if (method === CollateralMethods.claimExtraDebt) {
                await sendTx(method, payload, amount);
                return;
              }

              await this.MakeApprove({
                contractAddress: ENV.WORKNET_ROUTER,
                tokenAddress,
                amount: amountToApprove,
                symbol: method === CollateralMethods.addCollateral ? symbol : TokenSymbols.WUSD,
              }).then(async () => await sendTx(method, payload, amountToApprove));
            });
          };

          // Firstly check allowance then approve
          const needApproveBeforeRes = await getGasPrice(
            WQRouter,
            ENV.WORKNET_ROUTER,
            method,
            [...payload],
          );
          if (
            !needApproveBeforeRes.gasPrice
            && method !== CollateralMethods.claimExtraDebt
            && needApproveBeforeRes.msg.includes('insufficient allowance')
          ) {
            await this.MakeApprove({
              contractAddress: ENV.WORKNET_ROUTER,
              tokenAddress,
              amount: amountToApprove,
              symbol: method === CollateralMethods.addCollateral ? symbol : TokenSymbols.WUSD,
            }).then(async () => await makeTx());
          } else await makeTx();
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.collateral {

  &__content {
    overflow-x: auto;
  }

  &__title {
    font-style: normal;
    font-weight: 500;
    font-size: 25px;
    line-height: 130%;
    color: $black700;
  }

  &__header {
    background: rgba(0, 131, 199, 0.1);
    color: $blue;
    border-radius: 6px;
    height: max-content;
    padding: 8px 12px !important;
  }

}
.table {
  &_grid {
    min-width: 1180px;
    display: grid;
    align-content: center;
    align-items: center;
    justify-items: center;
    grid-template-columns: repeat(5, 1fr) 36px;

    text-align: center;

    padding: 0 12px;
    margin-top: 12px;
  }
  &__empty {
    margin-top: 20px;
  }
  &__pages {
    margin-top: 20px;
  }
}

.risk {

  &_low {
    box-shadow: inset 0 0 0 1px #e3c221;
  }

  &_medium {
    box-shadow: inset 0 0 0 1px #d28904;
  }

  &_high {
    box-shadow: inset 0 0 0 1px #dc0606;
  }
}

.item {
  height: 72px;
  background: white;
  border-radius: 6px;
  min-width: 1180px;

  &__wrapper {
    height: 72px;
    cursor: pointer;
  }

  &_full {
    height: auto;
  }

  &:hover {
    @include shadow;
  }

  &:not(:last-child) {
    margin-bottom: 12px;
  }

  &__coin {
    display: grid;
    grid-template-columns: 36px 1fr;
    align-items: center;
    font-weight: 500;
    font-size: 20px;
    line-height: 130%;
    color: $black600;
    &-icon {
      height: 30px;
      width: 30px;
    }
  }

  &__hash {
    text-decoration-line: none;
    color: $blue;
  }

  &__caret {
    padding-left: 12px;
    & span {
      font-size: 24px;
      color: $blue;
    }
  }

  &__actions {
    display: flex;
    padding: 0 12px;
  }

  &__btn {
    width: 150px;
    margin-right: 20px;
  }

}

.history {
  &__wrapper {
    display: grid;
    grid-template-rows: auto auto;

    margin-top: 12px;
  }

  &__table {
    min-width: 1180px;
    display: grid;
    align-content: center;
    align-items: center;
    justify-items: center;
    grid-template-columns: repeat(4, 0.7fr) repeat(2, 1fr);

    text-align: center;

    padding: 0 12px;
  }

  &__header {
    background: rgba(0, 131, 199, 0.1);
    color: $blue;
    height: max-content;
    padding: 3px 12px;
  }

  &__row {
    padding: 12px;
  }
}
</style>
