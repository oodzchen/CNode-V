<template>
  <page-container drawer ref="container" @loginuser="data => loginUser = data">
    <v-toolbar app tabs dark class="top-toolbar" color="primary">
      <v-btn icon @click="$refs.container.toggleDrawer()">
        <v-avatar v-if="accessToken && loginUser" size="30" color="accent">
          <img :src="loginUser.avatar_url">
        </v-avatar>
        <v-icon v-else>fa-user</v-icon>
      </v-btn>
      <v-toolbar-title>主页</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon value="notifications" to="/notifications">
        <v-badge
          overlap
          color="red"
        >
          <span v-if="unreadCount > 0" slot="badge">{{unreadCount}}</span>
          <v-icon>fa-bell</v-icon>
        </v-badge>
      </v-btn>
      <v-tabs 
        slot="extension"
        v-model="currTab" 
        grow 
        color="transparent"
        slider-color="white"
        @input="onTabsChange"
      >
        <v-tab v-for="item in tabs" :key="item.category">{{item.name}}</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content ref="content">
      <div class="loading text-center" v-show="showRefreshLoading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <v-tabs-items v-model="currTab">
        <v-tab-item
          v-for="(data, category) in tabsData"
          :key="category"
          :ref="`tab_item_${category}`"
          @scroll="onTabListScroll(category)"
        >
          <v-list v-if="data.length > 0" light three-line class="tab-list">
            <template v-for="(item, index) in data">
              <v-divider v-if="index !== 0" :key="index + '_divider'"></v-divider>
              <v-list-tile :key="index + '_tile'" :to="`/topic/${item.id}`">
                <v-list-tile-avatar>
                  <img :src="item.author.avatar_url">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <v-icon v-if="item.top" color="primary" small>fa-thumbtack</v-icon>
                    <v-icon v-if="item.good" color="primary" small>fa-star</v-icon>
                    {{item.title}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title>
                    <!-- <router-link tag="span" :to="`/user/${item.author.loginname}`">
                      <v-avatar size="24">
                        <img :src="item.author.avatar_url">
                      </v-avatar>
                      {{item.author.loginname}}
                    </router-link> -->
                    <v-chip small text-color="grey darken-2">{{tabsMap[item.tab]}}</v-chip> • {{item.author.loginname}} • {{item.reply_count}} 条回复 • {{item.create_at | timeFormattor}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
            <div v-if="data.length > 0" class="loading text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                v-show="tabsState[category].showGetMoreLoading"
              ></v-progress-circular>
            </div>
          </v-list>
        </v-tab-item>
      </v-tabs-items>

      <v-btn
        fixed
        fab 
        dark
        color="primary" 
        to="/new"
        class="btn-new"
      >
        <v-icon dark>fa-plus</v-icon>
      </v-btn>
    </v-content>
  </page-container>
</template>

<style lang="stylus">
.btn-new
  right: 16px
  bottom: 16px

.tab-list
  .theme--light.v-chip
    margin-left: 0
    margin-right: 0
  .v-list__tile__title
    .v-icon
      vertical-align: middle
</style>


<script>
import TABS from '@/data/tabs'

let tabsMap = {}

TABS.forEach(item => {
  tabsMap[item.category] = item.name
})

const NUM_PER_PAGE = 20

let primaryData = {
  currTab: null,
  tabs: TABS,
  tabsMap: tabsMap,
  tabsData: {},
  tabsState: {},
  showRefreshLoading: false,
  loginUser: null,
  accessToken: null,
  unreadCount: 0
}

TABS.forEach(tab => {
  primaryData.tabsData[tab.category] = []
  primaryData.tabsState[tab.category] = {
    showGetMoreLoading: false,
    currPage: 1
  }
})

let listViewHeight = 0

export default {
  data () {
    return primaryData
  },
  created () {
    this.accessToken = this.$localStorage.get('accessToken')

    if (this.accessToken) {
      this.getUnreadCount()
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.setTabListStyle()
    })

    window.addEventListener('resize', this.setTabListStyle.bind(this), false)
  },
  beforeDestroy () {
    this.showDrawer = false
  },
  methods: {
    setTabListStyle () {
      if (this.$refs && this.$refs.content) {
        let contentStyles = window.getComputedStyle(this.$refs.content.$el)
        let paddingTop = Number(contentStyles['padding-top'].replace(/px$/, ''))
        let paddingBottom = Number(contentStyles['padding-bottom'].replace(/px$/, ''))

        listViewHeight = window.innerHeight - paddingTop - paddingBottom

        Object.keys(this.tabsData).forEach(category => {
          let el = this.$refs[`tab_item_${category}`][0].$el
          el.style['height'] = listViewHeight + 'px'
          el.style['overflow-y'] = 'auto'
        })
      }
    },
    onTabsChange (index) {
      let category = this.tabs[index].category

      if (this.tabsData[category] && this.tabsData[category].length === 0) {
        this.showRefreshLoading = true
        this.ajax('/topics', {
          params: {
            tab: category === 'all' ? '' : category,
            limit: NUM_PER_PAGE,
            page: 1
          }
        })
          .then(data => {
            if (data.success) {
              this.tabsData[category] = data.data
              this.$nextTick(() => {
                this.cacheTopics(data.data)
              })
            }
          })
          .finally(() => {
            this.showRefreshLoading = false
          })
      }
    },
    onTabListScroll (category) {
      let el = this.$refs[`tab_item_${category}`][0].$el
      let list = el.children[0]
      if (Math.round(el.scrollTop) >= list.offsetHeight - listViewHeight) {
        let state = this.tabsState[category]
        state.showGetMoreLoading = true
        // this.getMoreListData()
        this.ajax('/topics', {
          params: {
            tab: category === 'all' ? '' : category,
            limit: NUM_PER_PAGE,
            page: ++state.currPage
          }
        }).then(data => {
          if (data.success) {
            this.tabsData[category].push(...data.data)
            this.$nextTick(() => {
              this.cacheTopics(data.data)
            })
          }
        })
          .finally(() => {
            state.showGetMoreLoading = false
          })
      }
    },
    cacheTopics (data) {
      data.forEach(item => {
        this.$localStorage.set(`topic_${item.id}`, JSON.stringify(item))
      })
    },
    getUnreadCount () {
      this.ajax('/message/count', {
        params: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        if (data.success) {
          this.unreadCount = data.data
        }
      })
    }
  }
}
</script>

