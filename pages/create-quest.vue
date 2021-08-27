<template>
  <div
    class="main"
    :class="{'main-white': step === 1}"
  >
    <div class="main__body page">
      <validation-observer
        v-slot="{handleSubmit, validated, passed, invalid}"
      >
        <div
          v-if="step === 1"
          class="page"
        >
          <h2 class="page__title">
            {{ $t('quests.createAQuest') }}
          </h2>
          <div class="page__category">
            <div class="page runtime">
              <div class="runtime__container">
                <base-field
                  v-model="runtimeValue"
                  :label="$t('quests.runtime.runtime')"
                  :placeholder="0"
                  :name="$t('quests.runtime.runtime')"
                  rules="required|decimal"
                />
                <div class="runtime__dd">
                  <base-dd
                    v-model="runtimeIndex"
                    type="blue"
                    :items="runtime"
                    :placeholder="$t('quests.createQuest.choosePeriod')"
                    rules="required"
                    :name="$t('quests.createQuest.choosePeriod')"
                  />
                </div>
              </div>
            </div>
            <div class="page__input">
              <base-field
                v-model="price"
                :label="$t('quests.price')"
                :placeholder="+0 + currency"
                rules="required|decimal"
                :name="$t('quests.price')"
              />
            </div>
            <div class="page__dd">
              <base-dd
                v-model="priorityIndex"
                :label="$t('quests.employment.employment')"
                type="gray"
                :items="employment"
                rules="required"
                :name="$t('quests.employment.employment')"
              />
            </div>
            <div class="page__dd">
              <base-dd
                v-model="categoryIndex"
                :label="$t('quests.distantWork.distantWork')"
                type="gray"
                :items="distantWork"
                rules="required"
                :name="$t('quests.distantWork.distantWork')"
              />
            </div>
          </div>
          <div
            v-for="key in specCount"
            :key="key"
            class="page__spec spec skills"
          >
            <div
              class="spec"
            >
              <div
                class="spec__category"
              >
                <base-dd
                  v-model="specIndex[key]"
                  type="gray"
                  :items="specializations.titles"
                  :placeholder="specializations.titles[0]"
                  @input="switchSkill($event, key)"
                />
                <base-btn
                  class="btn__delete"
                  mode="cross"
                  @click="removeSpecialization(key)"
                >
                  <span class="icon-off_outline_close" />
                </base-btn>
              </div>
            </div>
            <div
              class="skills"
            >
              <div class="skills__category">
                <base-dd
                  v-model="skillIndex[key]"
                  :label="$t('quests.skills.skills')"
                  :placeholder="$t('quests.skills.chooseSkills')"
                  :type="specIndex[key] < 0 ? 'disabled' : 'gray'"
                  :disabled="specIndex[key] < 0"
                  :items="specializations.skills[specIndex[key]]"
                  @input="addSkillToBadge($event, specializations.skills[specIndex[key]], skillIndex[key], key)"
                />
              </div>
              <div
                v-if="selectedSkills[key].length === 5"
                class="skills__alert"
              >
                {{ $t('quests.skills.limit') }}
              </div>
              <div
                class="skills__badges"
              >
                <div
                  v-for="(item, i) in selectedSkills[key]"
                  :key="i"
                  class="skills__badge"
                >
                  {{ item }}
                  <span
                    class="icon-close_small"
                    @click="removeSkillToBadge(item, key)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="page btn">
            <base-btn
              :text="$t('quests.spec.addSpec')"
              :disabled="specCount === 3"
              mode="outline"
              class="btn__spec"
              :class="specCount === 3 ? 'skills__btn-add_disabled' : ''"
              @click="addSpecialization"
            />
          </div>
          <div class="page__address">
            <base-field
              v-model="address"
              :label="$t('quests.address')"
              :placeholder="$t('quests.address')"
              mode="icon"
              :selector="true"
              rules="required"
              :name="$t('quests.address')"
              @selector="getAddressInfo(address)"
            >
              <template v-slot:left>
                <span class="icon-map" />
              </template>
              <template v-slot:selector>
                <div
                  v-if="addresses.length"
                  class="selector"
                >
                  <div class="selector__items">
                    <div
                      v-for="(item, i) in addresses"
                      :key="i"
                      class="selector__item"
                      @click="selectAddress(item)"
                    >
                      {{ item.formatted }}
                    </div>
                  </div>
                </div>
              </template>
            </base-field>
          </div>
          <div class="page__input">
            <base-field
              v-model="questTitle"
              rules="required"
              :name="$t('quests.questTitle')"
              :placeholder="$t('quests.questTitle')"
            />
          </div>
          <div class="page__input">
            <textarea
              id="textarea"
              v-model="textarea"
              class="page__textarea"
              :placeholder="$t('quests.questDesc')"
            />
          </div>
          <div class="page upload__container">
            <div class="upload__title">
              {{ $t('quests.uploadMaterials') }}
            </div>
            <dropzone
              id="uploader"
              ref="el"
              :options="optionsModal"
              :include-styling="true"
            />
          </div>
          <div class="upload btn btn__container btn__container_right">
            <div class="btn__create">
              <base-btn
                :disabled="!validated || !passed || invalid"
                @click="handleSubmit(toRiseViews)"
              >
                {{ $t('quests.createAQuest') }}
              </base-btn>
            </div>
          </div>
        </div>
        <div
          v-if="step === 2"
          class="page"
        >
          <div class="page btn-container__left">
            <div class="btn-container__btn_back">
              <base-btn
                :mode="'back'"
                @click="goBack()"
              >
                {{ $t('meta.back') }}
                <template v-slot:left>
                  <span class="icon-chevron_big_left" />
                </template>
              </base-btn>
            </div>
          </div>
          <div class="page page__raising">
            {{ $t('raising-views.raisingViews') }}
          </div>
          <div class="page period">
            <h3 class="period__choose">
              {{ $t('raising-views.choosePeriod') }}
            </h3>
            <div class="period__container">
              <div
                class="period__period"
                :class="{'period__period_active': period === 1}"
                @click="toFirstPeriod"
              >
                <h2
                  class="period__title"
                  :class="{'period__title_active': period === 1}"
                >
                  {{ $t('raising-views.forOneDay') }}
                </h2>
              </div>

              <div
                class="period__period"
                :class="{'period__period_active': period === 2}"
                @click="toSecondPeriod"
              >
                <h2
                  class="period__title"
                  :class="{'period__title_active': period === 2}"
                >
                  {{ $t('raising-views.forOneWeek') }}
                </h2>
              </div>

              <div
                class="period__period"
                :class="{'period__period_active': period === 3}"
                @click="toThirdPeriod"
              >
                <h3
                  class="period__title"
                  :class="{'period__title_active': period === 3}"
                >
                  {{ $t('raising-views.forOneMonth') }}
                </h3>
              </div>
            </div>

            <div class="period level">
              <div class="level__title">
                {{ $t('raising-views.chooseLevel') }}
              </div>
              <div
                v-if="period"
                class="level__container"
              >
                <div
                  v-for="(item, i) in periods(period)"
                  :key="i"
                  class="level__card"
                  :class="cardStatus(item)"
                  @click="selectRadio(i)"
                >
                  <div class="level__option">
                    <input
                      :ref="`radio${i}`"
                      name="higherLevel"
                      type="radio"
                      class="radio__input"
                      :value="item.cost"
                      @input="selectRadio(i)"
                    >
                  </div>
                  <div class="level card">
                    <div
                      class="card__level"
                      :class="cardStatus(item)"
                    >
                      {{ item.level }}
                    </div>
                    <div class="card__desc">
                      {{ item.desc }}
                    </div>
                  </div>
                  <div class="cost__container">
                    <div class="card__cost">
                      {{ item.cost }}$
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="btn-container">
              <div class="btn-container__btn">
                <base-btn
                  :mode="'outline'"
                  @click="showQuestCreatedModal()"
                >
                  {{ $t('meta.skipAndEnd') }}
                </base-btn>
              </div>
              <div class="btn-container__btn">
                <base-btn
                  :disabled="ads.currentAdPrice === ''"
                  @click="showPaymentModal"
                >
                  {{ $t('meta.pay') }}
                </base-btn>
              </div>
            </div>
          </div>
        </div>
      </validation-observer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Dropzone from 'nuxt-dropzone';
import 'nuxt-dropzone/dropzone.css';
import '~/assets/scss/vue2Dropzone.min.css';
import '~/assets/scss/dropzone.scss';
import modals from '~/store/modals/modals';

const { GeoCode } = require('geo-coder');

export default {
  name: 'CreateQuest',
  ...mapGetters({
    userData: 'user/getUserData',
  }),
  components: {
    Dropzone,
  },
  data() {
    return {
      ads: {
        currentAdPrice: '',
      },
      step: 1,
      period: 1,
      days: [
        {
          level: this.$t('quests.levels.1.title'),
          code: 1,
          desc: this.$t('quests.levels.1.desc'),
          cost: '10',
        },
        {
          level: this.$t('quests.levels.2.title'),
          code: 2,
          desc: this.$t('quests.levels.2.desc'),
          cost: '10',
        },
        {
          level: this.$t('quests.levels.3.title'),
          code: 3,
          desc: this.$t('quests.levels.3.desc'),
          cost: '10',
        },
        {
          level: this.$t('quests.levels.4.title'),
          code: 4,
          desc: this.$t('quests.levels.4.desc'),
          cost: '10',
        },
      ],
      weeks: [
        {
          level: this.$t('quests.levels.1.title'),
          code: 1,
          desc: this.$t('quests.levels.1.desc'),
          cost: '40',
        },
        {
          level: this.$t('quests.levels.2.title'),
          code: 2,
          desc: this.$t('quests.levels.2.desc'),
          cost: '10',
        },
        {
          level: this.$t('quests.levels.3.title'),
          code: 3,
          desc: this.$t('quests.levels.3.desc'),
          cost: '40',
        },
        {
          level: this.$t('quests.levels.4.title'),
          code: 4,
          desc: this.$t('quests.levels.4.desc'),
          cost: '40',
        },
      ],
      months: [
        {
          level: this.$t('quests.levels.1.title'),
          code: 1,
          desc: this.$t('quests.levels.1.desc'),
          cost: '70',
        },
        {
          level: this.$t('quests.levels.2.title'),
          code: 2,
          desc: this.$t('quests.levels.2.desc'),
          cost: '10',
        },
        {
          level: this.$t('quests.levels.3.title'),
          code: 3,
          desc: this.$t('quests.levels.3.desc'),
          cost: '70',
        },
        {
          level: this.$t('quests.levels.4.title'),
          code: 4,
          desc: this.$t('quests.levels.4.desc'),
          cost: '70',
        },
      ],
      specCount: 0,
      specIndex: {
        1: -1,
        2: -1,
        3: -1,
      },
      skillIndex: {
        1: -1,
        2: -1,
        3: -1,
      },
      selectedSkills: {
        1: [],
        2: [],
        3: [],
      },
      priorityIndex: 1,
      categoryIndex: 0,
      runtimeIndex: 0,
      periodIndex: 0,
      runtimeValue: '',
      questTitle: '',
      address: '',
      textarea: '',
      price: '',
      priceOfClick: '',
      city: '',
      coordinates: {},
      currency: ' WUSD',
      addresses: [],
      optionsModal: {
        url: 'http://httpbin.org/anything',
        addRemoveLinks: true,
        dictRemoveFile: '<span class="icon-close_big"></span>',
        dictCancelUpload: '<span class="icon-close_big"></span>',
        dictCancelUploadConfirmation: '',
        maxFiles: '3',
        dictDefaultMessage:
          '<div class="uploader__message_container">'
          + '<div class="uploader__message">Upload a images or videos</div><'
          + "span class='icon-add_to_queue'></span>"
          + '</div>',
      },
      file1: null,
      file2: null,
    };
  },
  computed: {
    specializations() {
      const specializations = Object.keys(this.$t('settings.specializations')).length;
      const specs = {
        titles: [],
        skills: [],
      };
      for (let i = 1; i < specializations; i += 1) {
        specs.skills.push(this.$t(`settings.specializations.${i}.sub`));
        specs.titles.push(this.$t(`settings.specializations.${i}.title`));
      }
      return specs;
    },
    runtime() {
      return [
        this.$t('quests.runtime.days'),
        this.$t('quests.runtime.weeks'),
        this.$t('quests.runtime.months'),
        this.$t('quests.runtime.years'),
      ];
    },
    employment() {
      return [
        this.$t('quests.employment.fullTime'),
        this.$t('quests.employment.partTime'),
        this.$t('quests.employment.fixedTerm'),
      ];
    },
    distantWork() {
      return [
        this.$t('quests.distantWork.distantWork'),
        this.$t('quests.distantWork.workInOffice'),
        this.$t('quests.distantWork.bothVariant'),
      ];
    },
  },
  async mounted() {
    this.SetLoader(true);
    this.SetLoader(false);
  },
  methods: {
    cardStatus(item) {
      let style;
      if (item.code === 1) {
        style = 'level__card_gold';
      } if (item.code === 3) {
        style = 'card__level_reliable';
      } if (item.code === 4) {
        style = 'card__level_checked';
      }
      return style;
    },
    periods(period) {
      let val;
      if (period === 1) {
        val = this.days;
      } if (period === 2) {
        val = this.weeks;
      } if (period === 3) {
        val = this.months;
      }
      return val;
    },
    selectRadio(idx) {
      const radio = this.$refs.[`radio${idx}`];
      for (let i = 0; i < Object.keys(this.$refs.[`radio${i}`]).length; i += 1) {
        if (radio[i].checked) {
          radio[i].checked = false;
          this.ads.currentAdPrice = '';
        } else if (!radio[i].checked) {
          radio[i].checked = true;
          this.ads.currentAdPrice = radio[i].value;
        }
        console.log(this.ads.currentAdPrice);
      }
    },
    toFirstPeriod() {
      this.period = 1;
    },
    toSecondPeriod() {
      this.period = 2;
    },
    toThirdPeriod() {
      this.period = 3;
    },
    toRiseViews() {
      this.step += 1;
    },
    showPaymentModal() {
      this.ShowModal({
        key: modals.paymentOptions,
        step: 1,
      });
    },
    goBack() {
      this.$router.go(-1);
    },
    addSkillToBadge(event, object, index, key) {
      if (!this.selectedSkills[key].includes(object[index]) && this.selectedSkills[key].length <= 4) {
        this.selectedSkills[key].push(object[index]);
      }
    },
    removeSkillToBadge(skillName, key) {
      const numberInArray = this.selectedSkills[key].indexOf(skillName);
      this.selectedSkills[key].splice(numberInArray, 1);
      if (!this.selectedSkills[key].length) {
        this.skillIndex[key] = -1;
      }
    },
    switchSkill(event, key) {
      this.skillIndex[key] = -1;
      this.selectedSkills[key] = [];
    },
    addSpecialization() {
      if (this.specCount <= 2) {
        this.specCount += 1;
      }
    },
    removeSpecialization(key) {
      this.selectedSkills[key] = [];
      this.specIndex[key] = -1;
      this.skillIndex[key] = -1;
      this.specCount -= 1;
    },
    selectAddress(address) {
      this.addresses = [];
      this.address = address.formatted;
    },
    async getAddressInfo(address) {
      let response = [];
      const geoCode = new GeoCode('google', { key: 'AIzaSyD32Aorm6CU9xUIrUznzYyw2d_0NTqt3Zw' });
      try {
        if (address.length) {
          response = await geoCode.geolookup(address);
          this.addresses = JSON.parse(JSON.stringify(response));
          this.coordinates = JSON.parse(JSON.stringify({ lng: response[0].lng, lat: response[0].lat }));
        }
      } catch (e) {
        console.log(e);
      }
    },
    async showQuestCreatedModal() {
      const createQuestData = {
        priority: this.priorityIndex,
        category: 'Default',
        title: this.questTitle,
        description: this.textarea,
        price: this.price,
        medias: [],
        adType: 0,
        location: {
          longitude: this.coordinates.lng,
          latitude: this.coordinates.lat,
        },
      };
      try {
        const response = await this.$store.dispatch('quests/questCreate', createQuestData);
        if (response) {
          this.ShowModal({
            key: modals.status,
            img: require('~/assets/img/ui/questAgreed.svg'),
            title: this.$t('modals.yourSkillsHaveBeenAdded'),
            subtitle: this.$t('modals.youCanUpdateThisInYourProfile'),
          });
          await this.$router.push(`/quests/${response.result.id}`);
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<style lang="scss" scoped>

.btn-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin: 20px 0 0 0;
  &__left {
    justify-content: flex-start;
    margin: 35px 0 0 0;
  }
  &__btn {
    width: 200px;
    margin: 0 10px 0 0;
    &_back {
      width: 50px;
    }
    &:last-child {
      margin: 0;
    }
  }
}

.cost__container {
  display: flex;
  align-self: center;
}

.card {
  border: none;
  &__level {
    @include text-simple;
    font-weight: 500;
    font-size: 12px;
    color: $white;
    background: #F7CF00;
    border-radius: 3px;
    width: 120px;
    padding: 2px 5px;
    text-align: center;
    &_reliable {
      background: #BBC0C7;
    }
    &_checked {
      background: #B79768;
    }
  }
  &__desc {
    @include text-simple;
    font-weight: 400;
    font-size: 16px;
    color: $black500;
    margin-top: 12px;
  }
  &__cost {
    @include text-simple;
    color: $black800;
    font-weight: 500;
    font-size: 20px;
    display: flex;
    justify-content: center;
  }
}

.level {
  &__title {
    @extend .period__title;
  }
  &__card {
    background: $white;
    border-radius: 6px;
    padding: 20px 0;
    display: grid;
    grid-template-columns: 1fr 15fr 1fr;
    margin: 20px 0 0 0;
    transition: 0.5s;
    &:hover {
      cursor: pointer;
      box-shadow: 0 0 10px 2px rgba(34, 60, 80, 0.09);
    }
    &_gold {
      border: 1px solid #F7CF00;
    }
  }
  &__option {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.radio {
  &__input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    border: 1px solid $blue;
    cursor: pointer;
    &:checked {
      background: radial-gradient($blue 50%, rgba(255, 0, 0, 0) 55%);
    }
  }
}

.period {
  &__choose {
    @extend .period__title;
    margin: 20px 0 0 0;
  }
  &__title {
    @include text-simple;
    font-weight: 400;
    font-size: 16px;
    color: $black800;
    &_active {
      color: $white;
    }
  }
  &__container {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    max-width: 1180px;
    width: 100%;
    margin: 10px 0 20px 0;
  }
  &__period {
    color: $black800;
    background: $white;
    padding: 12px 88px;
    border-radius: 6px;
    transition: .5s;
    text-align: center;
    width: inherit;
    margin: 0 20px 0 0;
    &:last-child {
      margin: 0;
    }
    &:hover {
      cursor: pointer;
      box-shadow: 0 0 10px 2px rgba(34, 60, 80, 0.09);
    }
    &_active {
      background: $blue;
      color: $white;
      &:hover {
        cursor: pointer;
        box-shadow: 0 0 10px 2px rgba(34, 60, 80, 0.09);
      }
    }
    &:last-child {
      margin: 0;
    }
    &__title {
      color: $black800;
      font-weight: 500;
      font-size: 16px;
    }
  }
}

.main {
  @include main;
  &-white {
    @include main;
    background: $white;
    background: #FFFFFF;
    margin: 0 0 20px 0;
    border-radius: 6px;
    justify-content: center;
  }
  &__body {
    max-width: 1180px;
    width: 100%;
    height: 100%;
  }
}

.runtime {
  &__container {
    display: grid;
    grid-template-columns: 6fr 2fr;
    grid-gap: 10px;
    align-items: flex-start;
  }
  &__dd {
    padding-top: 37px;
    height: 139px;
    display: flex;
    align-items: flex-start;
  }
}

.icon {
  &-close_small:before {
    content: "\e949";
    color: $red;
    font-size: 20px;
    cursor: pointer;
  }
  &-check_big:before {
    content: "\ea02";
    color: $white;
    font-size: 20px;
  }
  &-off_outline_close::before {
    content: "\ea2a";
    color: $red;
    font-size: 20px;
  }
  &-map::before {
    content: "\ea28";
    color: $blue;
    font-size: 20px;
  }
}
.selector {
  @include box;
  width: 100%;
  z-index: 140;
  &__items {
    background: #FFFFFF;
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }
  &__item {
    @include text-simple;
    padding: 15px 20px;
    background: #FFFFFF;
    font-weight: 500;
    font-size: 16px;
    color: $black800;
    cursor: pointer;
    transition: .3s;
    &:hover {
      background: #F3F7FA;
    }
  }
}

.payment {
  &__container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  &__title {
    @include text-simple;
    color: $black500;
    font-weight:400;
    font-size: 16px;
  }
  &__cost {
    @include text-simple;
    color: $blue;
    font-weight: 500;
    font-size: 16px;
    padding: 0 0 0 5px;
  }
}

.base-btn {
  @include text-simple;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 43px;
  color: #ffffff;
  font-size: 16px;
  line-height: 130%;
  text-align: center;
  transition: .3s;
  background: #0083C7;
  border-radius: 6px;
  &:hover {
    background: #103D7C;
  }
  &__passive {
    border: 1px solid rgba(0, 131, 199, 0.1);
    background: #FFFFFF;
    color: $blue;
    &:hover {
      background: #F7F8FA;
      color: $blue;
    }
  }
}

.upload {
  &__container {
    margin: 20px 0 0 0;
    width: 100%;
  }
  &__title {
    @include text-simple;
    font-weight: 500;
    color: $black800;
    font-size: 18px;
    padding: 0 0 20px 0;
  }
}

.btn {
  padding: 0;
  &__delete {
    height: 20px;
    width: 20px;
    border-radius: 50%;
  }
  &__create {
    width: 220px;
  }
  &__spec {
    width: 100%;
    padding: 6px 4px 6px 12px;
  }
  &__add {
    width: 100%;
    margin: 12px 0 0 0;
    padding: 6px 5px;
  }
  &__container {
    width: 100%;
    align-items: center;
    display: flex;
    &_left {
      margin: 20px 0 0 0;
      justify-content: flex-start;
      width: 100%;
    }
    &_right {
      justify-content: flex-end;
      width: 100%;
      margin: 20px 0 20px 0;
    }
  }
}

.half {
  width: 100%;
  max-width: 49%;
}

.skills {
  &__category {
    display: grid;
    margin: 20px 0 0 0;
    grid-template-columns: 7fr 1fr;
    grid-gap: 10px;
    align-items: center;
    @extend .half;
  }
  &__badges {
    margin: 16px 0 16px 0;
    display: flex;
  }
  &__badge {
    @include text-simple;
    display: flex;
    flex-direction: row;
    margin-right: 10px;
    background-color: rgba(0, 131, 199, 0.1);
    padding: 6px 10px;
    color: $blue;
    font-weight: 400;
    font-size: 14px;
    border: none;
    border-radius: 44px;
    align-items: center;
  }
  &__alert {
    @include text-simple;
    margin: 5px 0 0 0;
    font-weight: 400;
    font-size: 16px;
    color: $red;
    @extend .half;
  }
}

.spec {
  &__category {
    display: grid;
    grid-template-columns: 7fr 1fr;
    grid-gap: 10px;
    margin: 20px 0 0 0;
    align-items: center;
    @extend .half;
  }
  &__subcategory {
    margin: 20px 0 0 0;
    @extend .half;
  }
}

.page {
  &__title {
    @include text-simple;
    margin: 30px 0 0 0;
  }
  &__raising {
    @include text-simple;
    font-weight: 500;
    font-size: 20px;
    color: $black800;
    margin: 0 0 20px 0;
  }
  &__page {
    font-weight: 500;
    font-size: 25px;
    color: $black800;
  }
  &__dd {
    min-width: 160px;
  }
  &__category {
    align-items: flex-start;
    margin: 20px 0 0 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 20px;
  }
  &__address {
    margin: 20px 0 0 0;
    display: grid;
    grid-gap: 20px;
  }
  &__textarea {
    @include text-simple;
    border-radius: 6px;
    padding: 11px 20px 11px 15px;
    height: 214px;
    width: 100%;
    border: 0;
    background-color: #F3F7FA;
    resize: none;
    &::placeholder {
      color: $black300;
    }
  }
}

.main {
  @include main;
  &-white {
    border: 1px solid $black0;
    @include main-white;
  }
}

@include _1199 {
  .main__body {
    padding: 10px;
  }
}

@include _991 {
  .page {
    &__category {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@include _767 {
  .spec {
    &__category {
      max-width: 100%;
    }
  }
  .skills {
    &__category {
      max-width: 100%;
      grid-template-columns: 1fr;
    }
  }
  .btn {
    margin-top: 20px;
    width: 100%;
    &__create {
      width: 100%;
    }
  }
}

@include _575 {
  .page__category {
    grid-template-columns: auto;
  }
}
</style>
