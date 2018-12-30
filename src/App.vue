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
import { mapState } from 'vuex'

export default {
  name: 'App',
  data () {
    return {
    }
  },
  computed: mapState({
    themeColor: state => state.themeColor,
    snack: state => state.snack
  }),
  watch: {
    $route () {
      this.$store.commit('CHANGE_SNACK', {
        show: false
      })
    }
  },
  created () {
    bus.$on('themecolor', color => {
      window.document.querySelector('meta[name="theme-color"]').content = this.$vuetify.theme[color]
    })
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
