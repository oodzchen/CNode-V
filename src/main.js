// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'promise-polyfill/src/polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.css'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import mixins from './mixins/global-mixins'
import VueLocalStorage from 'vue-localstorage'
import VueAnalytics from 'vue-analytics'
import timeFormattor from '@/utils/time-formattor'

import PageContainer from '@/components/PageContainer'

Vue.use(VueLocalStorage)
Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    primary: '#80BD01',
    secondary: '#424242',
    accent: '#00C853',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    dark: '#212121'
  }
})
Vue.use(VueAnalytics, {
  id: 'UA-131361758-1',
  router,
  autoTracking: {
    page: process.env.NODE_ENV !== 'development',
    pageviewOnLoad: false
  },
  debug: process.env.DEBUG ? {
    enabled: true,
    trace: false,
    sendHitTask: true
  } : false
})

Vue.component('page-container', PageContainer)

Vue.mixin(mixins)
Vue.filter('timeFormattor', timeFormattor)

Vue.config.productionTip = false

/* eslint-disable no-new */
window.mainApp = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
