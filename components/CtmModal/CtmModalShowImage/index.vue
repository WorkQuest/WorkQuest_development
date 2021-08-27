<template>
  <ctm-modal-box
    class="ctm-modal"
    :is-header="false"
  >
    <div class="ctm-modal__content">
      <img
        :src="options.imageSrc"
        alt=""
      >
      <div class="ctm-modal__desc desc">
        <div
          v-if="options.title"
          class="desc__title"
        >
          {{ options.title }}
        </div>
        <div
          v-if="options.desc"
          class="desc__desc"
        >
          {{ options.desc }}
        </div>
      </div>
    </div>
  </ctm-modal-box>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ShowImage',
  computed: {
    ...mapGetters({
      options: 'modals/getOptions',
    }),
  },
  methods: {
    hide() {
      this.CloseModal();
    },
  },
};
</script>

<style lang="scss" scoped>
.ctm-modal {
  @include modalKit;
  &__box {
    max-width: 100% !important;
    width: auto !important;
    height: auto !important;
    padding: 0 !important;
  }
  &__content {
    padding: 28px 28px 5px 28px !important;
  }
  &__desc {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: baseline;
  }
}
.desc {
  &__title {
    @include text-simple;
    margin: 10px 10px 0 0;
    font-size: 18px;
    font-weight: 500;
  }
  &__desc {
    margin: 10px 10px 0 0;
    font-size: 16px;
    font-weight: 400;
  }
}

</style>
