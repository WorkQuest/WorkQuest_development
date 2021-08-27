<template>
  <div
    class="information-grid"
  >
    <div class="col info-grid__col_left">
      <div class="info-grid__avatar">
        <img
          v-if="imageData"
          class="info-grid__avatar"
          :src="imageData"
          :alt="localUserData.firstName"
        >
        <img
          v-else-if="!imageData"
          class="info-grid__avatar"
          src="~/assets/img/app/avatar_empty.png"
          :alt="localUserData.firstName"
        >
      </div>
      <div class="rating" />
      <div
        class="reviews-amount"
      >
        {{ `${quest.reviewCount} ${$t('quests.reviews')}` }}
      </div>
    </div>
    <div class="col info-grid__col">
      <div
        v-if="firstName && lastName"
        class="title"
      >
        {{ `${firstName} ${lastName}` }}
      </div>
      <div
        v-if="userRole === 'employer'"
        class="subtitle"
      >
        {{ company || userInfo.company }}
      </div>
      <div
        v-if="userDesc"
        class="description"
      >
        {{ userDesc }}
      </div>
      <div v-if="selected === 1 && userRole === 'worker' ">
        <div
          v-if="userEducations.length > 0"
        >
          <div
            class="knowledge__text"
          >
            {{ $t('profile.educations') }}
          </div>
          <div
            v-if="userEducations"
            class="work-exp__container"
          >
            <div
              v-for="(item, i) in userEducations"
              :key="i"
              class="work-exp__item"
            >
              <span class="work-exp__company">{{ item.place }}</span>
              <span class="work-exp__term">{{ `${item.from} - ${item.to}` }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="userWorkExp.length > 0"
        >
          <div
            class="work-exp__text"
          >
            {{ $t('profile.prevWorkExp') }}
          </div>
          <div class="work-exp__container">
            <div
              v-for="(item, i) in userWorkExp"
              :key="i"
              class="work-exp__item"
            >
              <span class="work-exp__company">{{ item.place }}</span>
              <span class="work-exp__term">{{ `${item.from} - ${item.to}` }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="socials">
        <socialPanel />
      </div>
      <div class="contacts__grid">
        <div class="contacts">
          <contactPanel />
          <div class="btn__container">
            <base-btn
              v-if="userRole === 'worker'"
              @click="toRaisedViews()"
            >
              {{ $t('profile.raiseViews') }}
            </base-btn>
            <span
              v-if="userRole === 'employer'"
              class="right"
            >
              <span
                v-if="selected === 1"
                class="message__container-btn"
              >
                <base-btn
                  mode="goToMessages"
                  class="message__btn"
                  @click="showMessages()"
                >
                  <template v-slot:right>
                    <span class="icon-chat" />
                  </template>
                  {{ $t('profile.writeAMessage') }}
                </base-btn>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <button
      @click="shareModal()"
    >
      <span class="share-btn" />
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import contactPanel from '~/components/app/panels/contact';
import socialPanel from '~/components/app/panels/social';
import modals from '~/store/modals/modals';

export default {
  name: 'UserInfo',
  components: { contactPanel, socialPanel },
  props: {
    selected: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      localUserData: {},
    };
  },
  computed: {
    ...mapGetters({
      tags: 'ui/getTags',
      userRole: 'user/getUserRole',
      userData: 'user/getUserData',
      userInfo: 'data/getUserInfo',
      imageData: 'user/getImageData',
      firstName: 'user/getFirstName',
      lastName: 'user/getLastName',
      company: 'user/getUserCompany',
      userDesc: 'user/getUserDesc',
      userEducations: 'user/getUserEducations',
      userWorkExp: 'user/getUserWorkExp',
      quest: 'data/getQuest',
    }),
  },
  async mounted() {
    this.localUserData = JSON.parse(JSON.stringify(this.userData));
  },
  methods: {
    shareModal() {
      this.ShowModal({
        key: modals.sharingQuest,
      });
    },
    showMessages() {
      this.$router.push('/messages/1');
    },
    toRaisedViews() {
      this.$router.push('/raising-views');
    },
  },
};
</script>

<style lang="scss" scoped>

.right {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

.btn {
  &__container {
    width: 100%;
    display: flex;
    align-items: flex-end;
    height: 43px;
  }
}

.icon {
  &-chat:before {
    content: "\e9ba";
    font-size: 14px;
    color: $green;
  }
  &-btn {
    &_right {
      margin: 0 5px 0 0;
    }
  }
}

.contacts {
  display: grid;
  grid-template-columns: 7fr 1fr;
}

.knowledge {
  &__text {
    @extend .work-exp__text;
  }
  &__term {
    @include text-simple;
    font-weight: 400;
    font-size: 14px;
    color: $black500;
  }
}

.work-exp {
  &__text {
    @include text-simple;
    font-weight: 500;
    font-size: 16px;
    color: $black700;
    margin: 15px 0 0 0;
  }
  &__container {
    display: flex;
    flex-direction: column;
    margin: 0 0 20px 0;
  }
  &__company {
    @extend .knowledge__term;
  }
  &__term {
    @extend .knowledge__term;
    color: $black300;
  }
}

.title {
  @include text-simple;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  color: $black800;
}

.styles {
  &__flex {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }
}

.information-grid {
  @extend .styles__flex;
  padding: 25px 0 0 0;
  position: relative;

  .share-btn {
    height: 24px;
    width: 24px;
    background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E\a         %3Cpath d='M17.5 22C16.4179 22.0125 15.3923 21.5181 14.7282 20.6637C14.0641 19.8094 13.8379 18.6935 14.117 17.648L7.85697 14.07C6.77525 15.0611 5.18965 15.2708 3.88746 14.5951C2.58526 13.9194 1.84384 12.5023 2.03134 11.0472C2.21883 9.5922 3.2953 8.40926 4.72625 8.08577C6.15719 7.76227 7.63783 8.36714 8.43297 9.60002L14.116 6.35102C14.0424 6.07321 14.0035 5.78738 14 5.50002C13.9856 3.82674 15.1478 2.37316 16.7832 2.01884C18.4186 1.66452 20.0781 2.50676 20.7576 4.03594C21.4371 5.56511 20.95 7.36125 19.5909 8.33753C18.2319 9.31381 16.3742 9.20211 15.142 8.07002L8.99097 11.585C8.98488 11.8443 8.94863 12.1021 8.88297 12.353L15.142 15.93C16.2942 14.8726 18.0087 14.7093 19.3399 15.5303C20.671 16.3514 21.2946 17.9568 20.8668 19.461C20.439 20.9653 19.0639 22.0023 17.5 22ZM17.5 17C16.6715 17 16 17.6716 16 18.5C16 19.3284 16.6715 20 17.5 20C18.3284 20 19 19.3284 19 18.5C19 17.6716 18.3284 17 17.5 17ZM5.49997 10C4.67154 10 3.99997 10.6716 3.99997 11.5C3.99997 12.3284 4.67154 13 5.49997 13C6.3284 13 6.99997 12.3284 6.99997 11.5C6.99997 10.6716 6.3284 10 5.49997 10ZM17.5 4.00002C16.6715 4.00002 16 4.67159 16 5.50002C16 6.32845 16.6715 7.00002 17.5 7.00002C18.3284 7.00002 19 6.32845 19 5.50002C19 4.67159 18.3284 4.00002 17.5 4.00002Z' fill='%237C838D'/%3E\a         %3C/svg%3E                                                                   \a         ");
    background-repeat: no-repeat;
    background-position: center;
    position: absolute;
    right: 0;
    top: 28px;

    &:hover {
      cursor: pointer;
    }
  }

  .col {
    @extend .styles__flex;
    align-self: flex-start;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
  }

  .avatar {
    border-radius: 89px;
  }

  .rating {
    height: 20px;
    background-image: url("data:image/svg+xml,%3Csvg width='120' height='20' viewBox='0 0 120 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E\a           %3Cpath d='M10 0L12.9389 5.95492L19.5106 6.90983L14.7553 11.5451L15.8779 18.0902L10 15L4.12215 18.0902L5.24472 11.5451L0.489435 6.90983L7.06107 5.95492L10 0Z' fill='%23E8D20D'/%3E\a           %3Cpath d='M35 0L37.9389 5.95492L44.5106 6.90983L39.7553 11.5451L40.8779 18.0902L35 15L29.1221 18.0902L30.2447 11.5451L25.4894 6.90983L32.0611 5.95492L35 0Z' fill='%23E8D20D'/%3E\a           %3Cpath d='M60 0L62.9389 5.95492L69.5106 6.90983L64.7553 11.5451L65.8779 18.0902L60 15L54.1221 18.0902L55.2447 11.5451L50.4894 6.90983L57.0611 5.95492L60 0Z' fill='%23E8D20D'/%3E\a           %3Cpath d='M85 0L87.9389 5.95492L94.5106 6.90983L89.7553 11.5451L90.8779 18.0902L85 15L79.1221 18.0902L80.2447 11.5451L75.4894 6.90983L82.0611 5.95492L85 0Z' fill='%23E8D20D'/%3E\a           %3Cpath d='M110 0L112.939 5.95492L119.511 6.90983L114.755 11.5451L115.878 18.0902L110 15L104.122 18.0902L105.245 11.5451L100.489 6.90983L107.061 5.95492L110 0Z' fill='%23E9EDF2'/%3E\a           %3C/svg%3E                                                              \a           ");
    background-repeat: no-repeat;
    background-position: center;
    margin-top: 20px;
    width: 142px;
  }

  .reviews-amount {
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 130%;
    text-decoration: none;
    color: #7C838D;
    text-align: center;
    margin-top: 5px;
  }

  .description {
    margin: 15px 0 0 0;
    font-weight: 400;
    font-size: 16px;
    color: $black600;
  }

  .socials {
    margin: 15px 0;
  }

  .socials a {
    display: inline-block;
  }

  .col .socials .icon {
    height: 24px;
    width: 24px;
    background-position: center;
    background-repeat: no-repeat;
    margin-right: 5px;
  }
}

.info-grid {
  &__avatar {
    width: 142px;
    height: 142px;
    border-radius: 50%;
    object-fit: cover;
  }
  &__col {
    padding-right: 0;
    &_left {
      max-width: 142px;
      padding: 0 15px 0 0;
    }
  }
}

@include _1199 {
  .contacts {
    grid-template-columns: 4fr 1fr;
    margin: 0 0 20px 0;
  }
}
@include _575 {
  .contacts {
    grid-template-columns: 1fr;
  }
  .information-grid {
    flex-direction: column;
    align-items: center;
    .col {
      margin-bottom: 10px;
      margin-left: auto;
      margin-right: auto;
    }
  }
}

</style>
