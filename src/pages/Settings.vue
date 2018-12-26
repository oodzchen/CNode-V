<template>
  <page-container :show-bottom-nav="false">
    <v-toolbar app tabs dark class="top-toolbar" color="primary">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>设置</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-list>
        <v-list-tile to="/settings/tabs">
          <v-list-tile-action>
            <v-icon>fa-th-large</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>首页板块</v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="clearCacheSheet = true">
          <v-list-tile-action>
            <v-icon>fa-hdd</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>清除缓存</v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="accessToken" @click="logoutSheet = true">
          <v-list-tile-action>
            <v-icon>fa-sign-out-alt</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>退出</v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/about">
          <v-list-tile-action>
            <v-icon>fa-info-circle</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>关于</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-content>

    <v-bottom-sheet v-model="clearCacheSheet">
      <v-list>
        <v-subheader>清除缓存</v-subheader>
        <v-list-tile v-if="accessToken" @click="clearCache(false)">
          <v-list-tile-title>保留登录数据</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="clearCache(true)">
          <v-list-tile-title>全部清除</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-bottom-sheet>

    <v-bottom-sheet v-model="logoutSheet">
      <v-list>
        <v-subheader>确定退出登录</v-subheader>
        <v-list-tile @click="logout" color="red">
          <v-list-tile-action>
            <v-icon color="red">fa-sign-out-alt</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>退出登录</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-bottom-sheet>

    <v-dialog 
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-model="chooseTabs">
      <v-card flat>
        <v-toolbar dark color="primary" fixed class="page-toolbar">
          <v-btn icon @click="$router.go(-1)">
            <v-icon>fa-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>首页板块</v-toolbar-title>
        </v-toolbar>

        <v-list class="checkbox-list">
          <v-subheader>最多选择5项</v-subheader>
          <v-list-tile
            v-for="(item, index) in tabs"
            :key="index"
          >
            <v-checkbox
              :disabled="isDisabled(item.category)"
              v-model="selectedTabs"
              :value="item.category"
            >
              <v-list-tile-content slot="label">{{item.name}}</v-list-tile-content>
            </v-checkbox>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-dialog>
  </page-container>
</template>

<style lang="stylus">
.checkbox-list
  .v-input--selection-controls .v-input__control,
  .v-input--selection-controls.v-input .v-label
    width: 100%
</style>


<script>
import tabs from '@/data/tabs'
import TABS_MAP from '@/data/tabs-map'

export default {
  props: {
    chooseTabs: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      accessToken: null,
      clearCacheSheet: false,
      logoutSheet: false,
      tabs: tabs,
      selectedTabs: []
    }
  },
  watch: {
    selectedTabs (newVal) {
      this.$localStorage.set('selectedTabs', this.selectedTabs)
    }
  },
  created () {
    this.accessToken = this.$localStorage.get('accessToken')
    let selectedTabs = this.$localStorage.get('selectedTabs')

    if (selectedTabs) {
      this.selectedTabs = selectedTabs.split(',')
    } else {
      this.selectedTabs = Object.keys(TABS_MAP).slice(0, 5)
      this.$localStorage.set('selectedTabs', this.selectedTabs.join(','))
    }
  },
  methods: {
    logout () {
      this.logoutSheet = false
      this.accessToken = null
      this.$localStorage.remove('accessToken')
      this.$localStorage.remove('loginUserId')
      this.$localStorage.remove('loginUser')

      this.$router.replace('/')
    },
    clearCache (clearAll) {
      this.clearCacheSheet = false
      if (clearAll) {
        this.accessToken = null
        window.localStorage.clear()
      } else {
        let token = this.$localStorage.get('accessToken')
        let id = this.$localStorage.get('loginUserId')
        let data = this.$localStorage.get('loginUser')
        window.localStorage.clear()
        this.$localStorage.set('accessToken', token)
        this.$localStorage.set('loginUserId', id)
        this.$localStorage.set('loginUser', data)
      }
    },
    isDisabled (category) {
      return category === 'all' ||
        (this.selectedTabs.length === 5 && this.selectedTabs.indexOf(category) === -1)
    }
  }
}
</script>

