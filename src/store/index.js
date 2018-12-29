import state from './state'
import mutations from './mutations'
import getters from './getters'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state,
  mutations,
  getters
})
