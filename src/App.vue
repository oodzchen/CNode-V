<template>
  <v-app :dark="themeColor === 'dark'" class="app-container" >
    <router-view></router-view>

    <v-snackbar
      :value="snack.show"
      bottom
      :color="snack.type"
      :timeout="snack.timeout"
      @input="onSnackChange"
    >{{snack.text}}</v-snackbar>
    <div class="page-loading text-center" v-show="pageLoading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
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

.page-loading
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 1000

  .v-progress-circular
    background-color: white;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5)

</style>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  data () {
    return {
    }
  },
  computed: mapState([
    'themeColor',
    'snack',
    'pageLoading'
  ]),
  watch: {
    $route () {
      this.$store.commit('CHANGE_PAGELOADING', false)
    },
    themeColor (newVal) {
      window.document.querySelector('meta[name="theme-color"]').content = this.$vuetify.theme[newVal]
    }
  },
  methods: {
    onSnackChange (val) {
      if (!val) {
        this.$store.commit('CHANGE_SNACK', {
          show: false
        })
      }
    }
  }
}
</script>
