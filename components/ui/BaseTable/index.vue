<template>
  <div
    class="table"
    data-selector="COMPONENT-BASE-TABLE"
  >
    <b-table
      :items="items"
      :fields="fields"
      borderless
      thead-class="table__header"
      caption-top
      :responsive="true"
      tbody-tr-class="table__row table__body"
    >
      <template
        v-if="$props.title"
        #table-caption
      >
        <span class="table__title">{{ $props.title }}</span>
      </template>
      <template #cell(tx_hash)="el">
        <a
          :href="getTransactionUrl(el.item.tx_hash)"
          target="_blank"
          class="table__url"
        >
          {{ CutTxn(el.item.tx_hash, 8, 4) }}
        </a>
      </template>
      <template #cell(status)="el">
        <span
          :class="{table__success: el.item.status, table__failed: !el.item.status}"
        >
          {{ el.item.status ? $t('meta.success') : $t('meta.fail') }}
        </span>
      </template>
      <template #cell(block)="el">
        <span class="table__grey">{{ el.item.block }}</span>
      </template>
      <template #cell(timestamp)="el">
        <span class="table__grey">{{ $moment(el.item.timestamp).format('lll') }}</span>
      </template>
      <template #cell(date)="el">
        <span class="table__grey">{{ $moment(el.item.date).format('lll') }}</span>
      </template>
      <template #cell(from_address)="el">
        <a
          :href="getAddressUrl(el.item.from_address)"
          target="_blank"
          class="table__url"
        >
          {{ CutTxn(el.item.network === Chains.WORKNET ? convertToBech32('wq', el.item.from_address) : el.item.from_address, 4, 4) }}
        </a>
      </template>
      <template #cell(to_address)="el">
        <a
          :href="getAddressUrl(el.item.to_address)"
          target="_blank"
          class="table__url"
        >
          {{ CutTxn(el.item.network === Chains.WORKNET ? convertToBech32('wq', el.item.to_address) : el.item.to_address, 4, 4) }}
        </a>
      </template>
      <template #cell(transaction_fee)="el">
        <span class="table__grey">{{ el.item.transaction_fee }}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Chains, WalletTokensData } from '~/utils/enums';

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      Chains,
    };
  },
  computed: {
    ...mapGetters({
      network: 'wallet/getSelectedNetwork',
    }),
  },
  methods: {
    getTransactionUrl(hash) {
      return `${WalletTokensData[this.network].explorer}/tx/${hash}`;
    },
    getAddressUrl(address) {
      return `${WalletTokensData[this.network].explorer}/address/${address}`;
    },
  },
};
</script>

<style lang="scss">
.table {
  overflow-x: hidden;
  font-size: 16px;
  line-height: 130%;
  background: #FFFFFF;
  border-radius: 6px;

  .table__body td:first-child {
    padding-left: 20px;
  }

  &__title {
    margin: 10px 10px 10px 20px;
    color: $black800;
  }

  &__success {
    color: $green;
  }

  &__failed {
    color: $red;
  }

  &__grey {
    color: $black500;
  }

  &__url:hover {
    text-decoration: none;
  }

  &__header {
    @include text-simple;
    background: rgba(0, 131, 199, 0.1);
    height: 27px;
    line-height: 17px;
    color: $blue;
    font-style: normal;
    font-size: 12px;
    word-break: break-word;

    tr th:first-child {
      padding-left: 20px;
    }
  }

  &__row {
    line-height: 40px;
  }
}
</style>
