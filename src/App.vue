<template>
  <v-app :dark="themeColor === 'dark'" class="app-container" >
    <router-view></router-view>

    <v-snackbar
      v-model="showAlert"
      top
      :color="alertType"
      :timeout="timeout"
    >{{alertText}}</v-snackbar>
  </v-app>
</template>

<style lang="stylus">
.text-center
  text-align: center

.loading
  padding: 20px 0
  height: 72px

.page-toolbar.v-toolbar--fixed
  position: sticky

.tab-list.v-list--three-line
  .v-list__tile
    height: auto
    padding-top: 10px
    padding-bottom: 10px

  .v-list__tile__title
    height: auto
    text-overflow: inherit
    white-space: normal

</style>

<script>
import bus from '@/utils/bus'

export default {
  name: 'App',
  data () {
    return {
      showAlert: false,
      alertType: '',
      alertText: '',
      timeout: 3000
    }
  },
  created () {
    bus.$on('snackshow', this.onSnackShow.bind(this))
    bus.$on('themecolor', color => {
      this.themeColor = color
      window.document.querySelector('meta[name="theme-color"]').content = this.$vuetify.theme[color]
    })
  },
  methods: {
    onSnackShow (type, text) {
      this.showAlert = true
      this.alertType = type
      this.alertText = text

      setTimeout(() => {
        this.showAlert = false
        this.alertType = ''
        this.alertText = ''
      }, this.timeout)
    }
  }
}
</script>
