<template>
  <div class="wallet">
    <div class="wallet__container">
      <div class="wallet__body">
        <div
          v-if="!isShowedBuyWqtNotification"
          class="buy-wqt"
        >
          <div class="buy-wqt__title">
            {{ $t('wallet.buyWQT.title') }}
          </div>
          <div class="buy-wqt__sub">
            <div>
              <div class="buy-wqt__sub_text">
                {{ $t('wallet.buyWQT.sub') }}
              </div>
              <div class="buy-wqt__sub_text">
                {{ $t('wallet.buyWQT.networks') }}
              </div>
            </div>
            <base-btn
              mode="outline"
              @click="showBuyWQTModal"
            >
              {{ $t('wallet.buyWQT.buyButton') }}
            </base-btn>
          </div>
        </div>
        <div class="wallet__nav">
          <span class="wallet__title">{{ $t('meta.wallet') }}</span>
          <div class="wallet__address">
            <div
              v-if="selectedNetwork === Chains.WORKNET"
              class="wallet__address-wrapper"
            >
              <base-dd
                v-model="addressType"
                :items="addressTypesDd"
                data-selector="ADDRESS-TYPE"
                class="wallet__address-type"
                type="underline"
                mode="blackFont"
              />
            </div>
            <div class="user">
              <span class="user__wallet">{{ shortWqAddress }}</span>
              <button-copy
                :copy-value="wqAddress"
                mode="wallet"
              />
            </div>
          </div>
        </div>
        <div
          class="wallet__info"
          :class="{'wallet__info_full' : cardClosed }"
        >
          <div class="wallet__balance balance">
            <div class="balance__top">
              <div class="wallet__switch-network switch-network">
                <base-dd
                  :value="selectedNetworkIndex"
                  data-selector="NETWORK"
                  type="border"
                  class="switch-network__dropdown"
                  :items="networkList"
                  is-icon
                  @input="handleSwitchNetwork"
                />
              </div>
              <span class="balance__title">{{ $t('meta.balance') }}</span>
              <span class="balance__currency">
                <span
                  class="balance__currency-text"
                  :class="{'balance__currency-text_light': isFetchingBalance}"
                >
                  {{ selectedTokenBalanceInfo }}
                </span>
                <span
                  v-if="selectedNetwork === Chains.WORKNET && selectedToken === TokenSymbols.WQT"
                  class="balance__frozen-mobile"
                >
                  <span class="balance__frozen-mobile_blue">
                    {{ $t('wallet.frozen') }}
                  </span>
                  {{ $t('meta.coins.count.WQTCount', {count: Floor(frozenBalance)}) }}
                </span>
                <span
                  v-else
                  class="balance__currency__margin-bottom"
                />
                <base-dd
                  v-if="tokens.length"
                  v-model="ddValue"
                  class="balance__token"
                  :items="tokens"
                  :placeholder="TokenSymbols.WQT"
                  data-selector="TOKENS"
                  type="border"
                  is-icon
                />
              </span>
              <span :class="[{'balance__currency__margin-bottom' : !(selectedNetwork === Chains.WORKNET && selectedToken === TokenSymbols.WQT)}]">
                <span
                  v-if="selectedNetwork === Chains.WORKNET && selectedToken === TokenSymbols.WQT"
                  class="balance__frozen balance__frozen_blue"
                >
                  <span class="balance__frozen">
                    {{ $t('wallet.frozen') }}
                  </span>
                  {{ $t('meta.coins.count.WQTCount', {count: Floor(frozenBalance)}) }}
                </span>
              </span>
            </div>
            <div class="balance__bottom">
              <base-btn
                data-selector="SHOW-DEPOSIT-MODAL"
                class="balance__btn"
                @click="showDepositModal"
              >
                {{ $t('wallet.deposit') }}
              </base-btn>
              <base-btn
                data-selector="SHOW-TRANSFER-MODAL"
                class="balance__btn"
                @click="showTransferModal"
              >
                {{ $t('modals.titles.withdraw') }}
              </base-btn>
              <base-btn
                data-selector="SHOW-WITHDRAW-MODAL"
                class="balance__btn"
                @click="showBuyWQTModal"
              >
                {{ $t('meta.btns.swap') }}
              </base-btn>
            </div>
          </div>
          <div
            v-if="!cardClosed"
            class="wallet__card card"
          >
            <span class="card__title">{{ $t('wallet.addCardProposal') }}</span>
            <span
              class="icon-close_big card__icon"
              @click="cardClosed = true"
            />
            <base-btn
              data-selector="SHOW-ADD-CARD-MODAL"
              class="card__btn"
              mode="outline"
              :disabled="true"
              @click="ShowModal({key: 'addCard', branchText: 'adding' })"
            >
              {{ $t('modals.coming') }}
            </base-btn>
          </div>
        </div>
        <div class="wallet__table-wrapper">
          <div class="wallet__switch-table">
            <base-btn
              data-selector="SWITCH-ALL"
              :mode="getSwitchButtonMode(WalletTables.TXS)"
              @click="selectedWalletTable = WalletTables.TXS"
            >
              {{ $t('meta.allTransactions') }}
            </base-btn>
            <!-- TODO del v-show, this plug for release -->
            <base-btn
              v-show="!IS_PLUG_PROD && selectedNetwork === Chains.WORKNET"
              data-selector="SWITCH-COLLATERAL"
              :mode="getSwitchButtonMode(WalletTables.COLLATERAL)"
              @click="selectedWalletTable = WalletTables.COLLATERAL"
            >
              {{ $t('meta.collateralTransactions') }}
            </base-btn>
          </div>
          <div
            v-if="selectedWalletTable === WalletTables.TXS"
            class="wallet__txs"
          >
            <div class="wallet__table table">
              <base-table
                class="table__txs"
                :title="$tc('wallet.table.trx')"
                :items="transactions"
                :fields="walletTableFields"
              />
              <empty-data
                v-if="!totalPages"
                :description="$tc('wallet.table.empty')"
                class="table__empty"
              />
            </div>
            <base-pager
              v-if="totalPages > 1"
              v-model="currentPage"
              :total-pages="totalPages"
            />
          </div>
          <!-- TODO del v-if, remove this plug for release -->
          <div
            v-if="selectedWalletTable === WalletTables.COLLATERAL && !IS_PLUG_PROD"
            class="wallet__txs"
          >
            <CollateralTable />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import BigNumber from 'bignumber.js';
import modals from '~/store/modals/modals';
import { ERC20 } from '~/abi/index';
import {
  Chains,
  AddressType,
  TokenSymbols,
  WalletTables,
  WalletTokensData,
} from '~/utils/enums';
import EmptyData from '~/components/app/info/emptyData';
import CollateralTable from '~/components/app/pages/wallet/CollateralTable';
import { error, success } from '~/utils/web3';
import { BuyWQTTokensData, SwapAddresses } from '~/utils/сonstants/bridge';
import { IS_PLUG_PROD } from '~/utils/locker-data';

export default {
  name: 'Wallet',
  middleware: 'auth',
  components: { EmptyData, CollateralTable },
  data() {
    return {
      cardClosed: false,
      ddValue: 0,
      txsPerPage: 10,
      currentPage: 1,
      selectedWalletTable: WalletTables.TXS,
      isFetchingBalance: false,
      shortWqAddress: '',
      isShowedBuyWqtNotification: true,
      addressType: 0,

      prevSelectedTokenBalance: null,

      IS_PLUG_PROD,

      Chains,
      WalletTables,
      TokenSymbols,
    };
  },
  computed: {
    ...mapGetters({
      userRole: 'user/getUserRole',
      userWalletAddress: 'user/getUserWalletAddress',
      balance: 'wallet/getBalanceData',
      transactions: 'wallet/getTransactions',
      selectedToken: 'wallet/getSelectedToken',
      frozenBalance: 'wallet/getFrozenBalance',
      transactionsCount: 'wallet/getTransactionsCount',
      isWalletConnected: 'wallet/getIsWalletConnected',
      selectedNetwork: 'wallet/getSelectedNetwork',
    }),
    tokens() {
      return WalletTokensData[this.selectedNetwork].tokenList || [];
    },
    tokensMap() {
      const res = {};
      this.tokens.forEach((token, i) => {
        res[token.title] = { ...token, index: i };
      });
      return res;
    },
    networkList() {
      return [
        SwapAddresses.get(Chains.WORKNET),
        BuyWQTTokensData.get(Chains.ETHEREUM),
        BuyWQTTokensData.get(Chains.BINANCE),
        BuyWQTTokensData.get(Chains.POLYGON),
      ];
    },
    selectedNetworkIndex() {
      for (let i = 0; i < this.networkList.length; i += 1) {
        if (this.networkList[i].chain === this.selectedNetwork) return i;
      }
      console.error('Error on: selectedNetworkIndex', this.selectedNetwork);
      return 0;
    },
    fetchTransactions() {
      return this.selectedNetwork === Chains.WORKNET
        ? this.fetchWorknetTransactions
        : this.fetchEtherscanTransactions;
    },
    nativeTokenSymbol() {
      return WalletTokensData[this.selectedNetwork].tokenList[0].title;
    },
    selectedTokenAddress() {
      return this.tokensMap[this.selectedToken]?.tokenAddress;
    },
    selectedTokenData() {
      return this.balance[this.selectedToken];
    },
    selectedTokenBalanceInfo() {
      if (!this.selectedTokenData) return this.selectedToken;
      return `${this.selectedTokenData?.balance || '0'} ${this.selectedToken}`;
    },
    addressTypesDd() {
      return [AddressType.BECH32, AddressType.HEX];
    },
    wqAddress() {
      if (this.selectedNetwork === Chains.WORKNET) {
        if (this.addressType === 0) return this.convertToBech32('wq', this.userWalletAddress);
      }
      return this.userWalletAddress;
    },
    totalPages() {
      if (!this.transactionsCount) return 0;
      return Math.ceil(this.transactionsCount / this.txsPerPage);
    },
    walletTableFields() {
      return [
        { key: 'tx_hash', label: this.$t('wallet.table.txHash'), sortable: true },
        { key: 'status', label: this.$t('wallet.table.status'), sortable: true },
        { key: 'block', label: this.$t('wallet.table.block'), sortable: false },
        { key: 'timestamp', label: this.$t('wallet.table.timestamp'), sortable: true },
        { key: 'from_address', label: this.$t('meta.fromBig'), sortable: true },
        { key: 'to_address', label: this.$t('meta.toBig'), sortable: true },
        { key: 'value', label: this.$t('wallet.table.transferred'), sortable: true },
        { key: 'transaction_fee', label: this.$t('wallet.table.trxFee'), sortable: false },
      ];
    },
  },
  watch: {
    addressType() {
      this.updateWQAddress();
    },
    async selectedNetwork() {
      this.ddValue = 0;
      this.addressType = this.selectedNetwork === Chains.WORKNET ? 0 : 1;
      this.currentPage = 1;
      await this.loadData(true);
      this.updateWQAddress();
    },
    async selectedToken() {
      this.ddValue = this.tokensMap[this.selectedToken].index;
    },
    async ddValue(newVal) {
      await this.$store.dispatch('wallet/setSelectedToken', this.tokens[newVal].title);
      await this.loadData(true);
    },
    currentPage() {
      this.getTransactions();
    },
  },
  beforeMount() {
    this.$store.dispatch('wallet/checkWalletConnected', { nuxt: this.$nuxt });
  },
  async mounted() {
    if (!this.$cookies.get('isWalletAppShowed')) {
      this.ShowModal({
        key: modals.downloadApp,
        title: this.$tc('modals.titles.downloadWallet'),
        subtitle: this.$t('modals.downWalletOnSmartphone'),
        app: 'isWalletAppShowed',
      });
    }
    if (!this.isWalletConnected) return;

    this.updateWQAddress();
    window.addEventListener('resize', this.updateWQAddress);

    if (this.tokens[this.ddValue].title !== this.selectedToken) {
      const i = this.tokens.findIndex((item) => item.title === this.selectedToken);
      if (i !== -1) this.ddValue = i;
    }

    await this.$store.dispatch('wallet/setCallbackWS', this.loadData);
    await this.loadData(true);
    if (this.selectedToken === TokenSymbols.WQT && this.selectedTokenData.balance <= 0) {
      this.isShowedBuyWqtNotification = false;
    }
  },
  async beforeDestroy() {
    await this.$store.dispatch('wallet/connectToProvider', Chains.WORKNET);
    await this.$store.dispatch('wallet/setCallbackWS', null);

    window.removeEventListener('resize', this.updateWQAddress);
  },
  methods: {
    ...mapActions({
      fetchWorknetTransactions: 'wallet/getWorknetTransactions',
      fetchEtherscanTransactions: 'wallet/getEtherscanTransactions',
    }),

    updateWQAddress() {
      const w = window.innerWidth;
      if (w > 678) this.shortWqAddress = this.wqAddress;
      else if (w > 400) this.shortWqAddress = this.CutTxn(this.wqAddress, 8, 8);
      else this.shortWqAddress = this.CutTxn(this.wqAddress, 4, 8);
    },
    async handleSwitchNetwork(index) {
      if (this.selectedNetworkIndex === index) return;
      await this.$store.dispatch('wallet/connectToProvider', this.networkList[index].chain);
    },
    async showBuyWQTModal() {
      if (this.selectedNetwork === Chains.WORKNET) {
        this.SetLoader(true);
        const res = await this.$store.dispatch('wallet/connectToProvider', Chains.ETHEREUM);
        this.SetLoader(false);
        if (!res.ok) {
          this.ShowModal(res.msg);
          return;
        }
      }
      this.ShowModal({ key: modals.buyWQT });
    },
    getSwitchButtonMode(btn) {
      if (btn === this.selectedWalletTable) return '';
      return 'outline';
    },
    async getTransactions() {
      await this.fetchTransactions({
        params: {
          limit: this.txsPerPage,
          offset: this.txsPerPage * (this.currentPage - 1),
        },
        currentPage: this.currentPage,
        network: this.selectedNetwork,
      });
    },
    async loadData(isShowLoading) {
      if (this.isFetchingBalance) return;

      if (isShowLoading) this.isFetchingBalance = true;
      const { selectedToken, userWalletAddress, selectedTokenAddress } = this;

      // 0 token is always native token for current network!
      if (this.nativeTokenSymbol === selectedToken) {
        const toFetch = [this.$store.dispatch('wallet/getBalance')];
        if (this.selectedNetwork === Chains.WORKNET) {
          toFetch.push(this.$store.dispatch('wallet/updateFrozenBalance'));
        }
        await Promise.all(toFetch);
      } else {
        await this.$store.dispatch('wallet/fetchWalletData', {
          address: userWalletAddress,
          token: selectedTokenAddress,
          symbol: selectedToken,
        });
      }

      this.isFetchingBalance = false;
      await this.getTransactions();
      if (!isShowLoading && this.prevSelectedTokenBalance !== this.selectedTokenData.fullBalance) {
        this.ShowToast(`Balance update (${this.selectedToken})`, 'Wallet');
      }
      this.prevSelectedTokenBalance = this.selectedTokenData.fullBalance;
    },
    showDepositModal() {
      this.ShowModal({
        key: modals.deposit,
        addressType: this.addressType,
      });
    },
    showTransferModal() {
      if (this.isFetchingBalance) return;
      this.ShowModal({
        key: modals.walletWithdraw,
        submit: async ({ recipient, amount, selectedToken }) => {
          const {
            wqAddress, convertToHex, nativeTokenSymbol,
          } = this;
          recipient = convertToHex('wq', recipient);
          const value = new BigNumber(amount).shiftedBy(Number(this.selectedTokenData.decimals)).toString();
          let feeRes;
          if (nativeTokenSymbol === selectedToken) {
            feeRes = await this.$store.dispatch('wallet/getTransferFeeData', {
              recipient,
              value: amount,
            });
          } else {
            feeRes = await this.$store.dispatch('wallet/getContractFeeData', {
              method: 'transfer',
              abi: ERC20,
              contractAddress: this.selectedTokenAddress,
              data: [recipient, value],
            });
          }
          this.ShowModal({
            key: modals.transactionReceipt,
            fields: {
              from: { name: this.$t('meta.fromBig'), value: wqAddress },
              to: { name: this.$t('meta.toBig'), value: recipient },
              amount: {
                name: this.$t('modals.amount'),
                value: amount,
                symbol: selectedToken, // REQUIRED!
              },
              fee: { name: this.$t('wallet.table.trxFee'), value: feeRes.result.fee, symbol: nativeTokenSymbol },
            },
            submitMethod: async () => {
              this.CloseModal();
              const action = selectedToken === nativeTokenSymbol ? 'transfer' : 'transferToken';
              const payload = selectedToken === nativeTokenSymbol
                ? { recipient, value: amount }
                : {
                  abi: ERC20,
                  address: this.selectedTokenAddress,
                  data: [recipient, value],
                };
              const { ok, result } = await this.$store.dispatch(`wallet/${action}`, payload);
              if (ok) {
                await this.ShowModal({
                  key: modals.transactionSend,
                  txUrl: `${WalletTokensData[this.selectedNetwork].explorer}/tx/${result.transactionHash}`,
                });
                await this.loadData();
                return success();
              }
              await this.ShowModal({ key: modals.transactionSend, mode: 'error' });
              return error();
            },
          });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>

.buy-wqt {
  position: relative;
  margin-top: 20px;
  border-radius: 6px;
  padding: 20px;
  background: $blue;
  color: $white100;
  &__title {
    font-size: 22px;
    font-weight: 500;
  }
  &__sub {
    display: grid;
    grid-template-columns: 80% 1fr;
  }
}

.table {
  &__container {
    width: 100%;
  }
}

.status {
  &__title {
    font-weight: 400;
    font-size: 16px;
    color: $black800;
  }

  &__date {
    font-weight: 400;
    font-size: 14px;
    color: $black300;
  }
}

.btn {
  &__container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 16px 0 0 0;
    grid-gap: 20px;
  }
}

.user {
  display: flex;
  align-items: center;
}

.wallet {
  &__container {
    display: flex;
    justify-content: center;
  }

  &__card {
    @include shadow;
  }

  &__balance {
    @include shadow;
  }

  &__body {
    max-width: 1180px;
    width: calc(100vw - 40px);
  }

  &__nav {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    align-items: center;
  }

  &__address {
    @include text-simple;
    display: flex;
    font-weight: 500;
    font-size: 16px;
  }

  &__address-wrapper {
    margin-bottom: 5px;
    margin-right: 10px;
  }

  &__address-type {
    display: inline-block;
  }

  &__title {
    @include text-simple;
    font-size: 25px;
    font-weight: 500;
    margin-right: 10px;
  }

  &__info {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr 479px;
    grid-gap: 20px;

    &_full {
      grid-template-columns: 1fr;
    }
  }

  &__switch-table {
    display: grid;
    grid-template-columns: repeat(2, 210px);
    grid-gap: 10px;
    margin-bottom: 20px;
    padding: 0 20px;
  }

  &__table {
    position: relative;
    @include shadow;
    max-width: 100%;
    overflow-x: auto;
  }
}

.balance {
  display: flex;
  background: $white;
  justify-content: space-between;
  flex-direction: column;
  border-radius: 6px;
  width: 100%;
  padding: 20px 20px 0 20px;
  margin: 0 0 20px 0;

  &__dollar {
    font-weight: 400;
    font-size: 14px;
    color: $black300;
  }

  &__number {
    font-weight: 700;
    font-size: 25px;
    color: $blue;
  }

  &__title {
    font-weight: 400;
    font-size: 16px;
    color: $black800;
  }

  &__top {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &__bottom {
    display: flex;
    grid-gap: 20px;
    padding: 20px 0 20px 0;
  }

  &__title {
    @include text-simple;
    color: #4C5767;
  }

  &__currency {
    @include text-simple;
    color: $black800;
    font-weight: 600;
    font-size: 35px;
    line-height: 130%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__margin-bottom {
      margin-bottom: 25px;
    }

    @include _767 {
      font-size: 26px;
    }

    &-text {
      max-width: 1000px;
      padding-right: 20px;
      word-break: break-word;
      height: fit-content;
      &_light {
        color: $black500;
      }
    }
  }

  &__token {
    height: 49px;
    box-sizing: border-box;
  }

  &__frozen {
    @include text-simple;
    height: 24px;
    color: $black800;

    &_blue {
      color: $blue;
    }

    &-mobile {
      display: none;
      color: $black800;
      font-size: 18px;
      font-weight: normal;

      height: fit-content;
      word-break: break-word;

      &_blue {
        color: $blue;
      }
    }
  }
}

.card {
  margin: 0 0 20px 0;
  width: 100%;
  padding: 20px;
  display: grid;
  grid-template-rows: auto 43px;
  grid-gap: 10px;
  grid-template-columns: 230px 1fr;
  @include text-simple;
  background: $blue url('/img/app/card.svg') no-repeat right center;
  background-size: cover;
  color: $white;
  position: relative;
  overflow: hidden;
  border: none !important;

  &__title {
    @include text-simple;
    color: $white;
    font-weight: 500;
    font-size: 20px;
    line-height: 130%;
  }

  &__btn {
    grid-column-start: 2;
    z-index: 2;
  }

  &__img {
    position: absolute;
    left: 144px;
    top: -43px;
    width: 355px;
    height: 250px;
    z-index: 1;
    object-fit: cover;
  }

  &__icon {
    display: flex;
    justify-self: self-end;
    height: 20px;
    width: 20px;
    z-index: 2;

    &:before {
      cursor: pointer;
      font-size: 20px;
      color: $white;
    }
  }
}

.table {
  background: #FFFFFF;
  width: 1180px;
  &__txs {
    margin: 0 !important;
    border-radius: 6px !important;
  }

  &__empty {
    background: #FFFFFF !important;
    margin: 10px 0 !important;
  }
}

.switch-network {
  &__dropdown {
    margin-bottom: 10px;
    width: 200px;
  }
}

@include _1199 {
  .wallet {
    &__info {
      display: flex;
      flex-direction: column-reverse;
    }
  }
  .card {
    margin: 0;
    grid-template-columns: 2fr 1fr;
    height: 240px;
  }
}

@include _767 {
  .card {
    grid-template-columns: repeat(2, 1fr);
  }
  .balance__bottom {
    gap: 10px;
  }
  .buy-wqt__sub {
    grid-template-columns: 1fr;
    grid-gap: 10px
  }
}

@include _480 {
  .balance {
    &__currency {
      display: flex;
      flex-direction: column;
      align-items: unset;
    }

    &__token {
      margin-top: 5px;
    }
  }
  .balance__frozen {
    display: none;

    &-mobile {
      display: block;
    }
  }
  .wallet{
    &__switch-table {
      grid-template-columns: 1fr;
    }
    &__nav {
      flex-direction: column;
    }
    &__title {
      margin-right: 0;
    }
  }
  .balance__bottom {
    display: grid !important;
  }
}
</style>
