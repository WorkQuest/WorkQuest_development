export default {
  async getUserPortfolios({ commit }, id) {
    const response = await this.$axios.$get(`/v1/user/${id}/portfolio/cases`);
    commit('setUserPortfolioCases', response.result);
    return response;
  },
  async setCaseImage({ commit }, { url, formData, type }) {
    const response = await this.$axios.$put(url, formData, {
      headers: {
        'Content-Type': type,
        'x-amz-acl': 'public-read',
      },
    });
    commit('setCaseImage', response.result);
    return response;
  },
  async setCaseData({ commit }, payload) {
    const response = await this.$axios.$post('/v1/portfolio/add-case', payload);
    commit('setCaseData', response.result);
    console.log(response);
    return response;
  },
  async deletePortfolio({ commit }, id) {
    const response = await this.$axios.$delete(`/v1/portfolio/${id}`);
    commit('setUserPortfolioCases', response.result);
    return response;
  },

  async getAllUserReviews({ commit }, id) {
    const response = await this.$axios.$get(`/v1/user/${id}/reviews`);
    commit('setUserReviews', response.result);
    return response;
  },

  async signIn({ commit, dispatch }, payload) {
    const response = await this.$axios.$post('/v1/auth/login', payload);
    commit('setTokens', response.result);
    if (response.result.userStatus === 1) {
      await dispatch('getUserData');
    }
    return response;
  },
  async signUp({ commit }, payload) {
    const response = await this.$axios.$post('/v1/auth/register', payload);
    commit('setTokens', response.result);
    return response;
  },
  async confirm({ commit }, payload) {
    commit('setTokens', { access: this.$cookies.get('access'), refresh: this.$cookies.get('refresh') });
    this.$cookies.set('role', payload.role);
    const response = await this.$axios.$post('/v1/auth/confirm-email', payload);
    return response;
  },
  async getUserData({ commit }) {
    const response = await this.$axios.$get('/v1/profile/me');
    commit('setUserData', response.result);
    return response;
  },
  async setUserRole({ commit }, payload) {
    const response = await this.$axios.$post('/v1/profile/set-role', payload);
    commit('setUserRole', response.result);
    return response;
  },
  async editUserData({ commit }, payload) {
    const response = await this.$axios.$put('/v1/profile/edit', payload);
    commit('setUserData', response.result);
    return response;
  },
  async logout({ commit }) {
    commit('logOut');
  },
  async refreshTokens({ commit }) {
    const response = await this.$axios.$post('/v1/auth/refresh-tokens');
    commit('setTokens', response.result);
    return response;
  },
  async setCurrentPosition({ commit }, payload) {
    commit('setCurrentUserPosition', payload);
  },
  async editUserPassword({ commit }, payload) {
    const response = await this.$axios.$put('/v1/profile/change-password', payload);
    commit('setUserPassword', response.result);
    return response;
  },
  async passwordSendCode({ commit }, payload) {
    const response = await this.$axios.$post('/v1/restore-password/send-code', payload);
    commit('setSendCode', response.result);
    return response;
  },
  async passwordChange({ commit }, payload) {
    const response = await this.$axios.$post('/v1/restore-password/set-password', payload);
    commit('setUserPassword', response.result);
    return response;
  },

  // Change avatar
  async imageType({ commit }, payload) {
    const response = await this.$axios.$post('/v1/storage/get-upload-link', payload);
    commit('setImageType', response.result);
    return response;
  },
  async setImage({ commit }, { url, formData, type }) {
    const response = await this.$axios.$put(url, formData, {
      headers: {
        'Content-Type': type,
        'x-amz-acl': 'public-read',
      },
    });
    commit('setImage', response.result);
    return response;
  },

  async disable2FA(payload) {
    return await this.$axios.$post('/v1/totp/disable', payload);
  },
  async enable2FA(payload) {
    return await this.$axios.$post('/v1/totp/enable', payload);
  },
  async confirmEnable2FA(payload) {
    return await this.$axios.$post('/v1/totp/confirm', payload);
  },

  async sendPhone(payload) {
    return await this.$axios.$post('/v1/profile/phone/send-code', payload);
  },
  async confirmPhone(payload) {
    return await this.$axios.$post('/v1/profile/phone/confirm', payload);
  },
};
