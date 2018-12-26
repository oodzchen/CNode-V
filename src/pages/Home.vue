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
        @input="onTabChange"
      >
        <v-tab 
          v-for="(item, index) in tabs" 
          :key="index"
          @click="onTabClick(item, index)"
        >{{item.name}}</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content ref="content">
      <div class="loading text-center" v-show="showRefreshLoading">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <v-tabs-items v-model="currTab">
        <v-tab-item
          v-for="(item, index) in tabs"
          :key="index"
          :ref="`tab_item_${item.category}`"
          @scroll="onTabListScroll(item.category)"
          class="tab-item-wrap"
        >
          <v-list v-if="tabsData[item.category].length > 0" light three-line class="tab-list">
            <template v-for="(item, index) in tabsData[item.category]">
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
                    <v-chip small text-color="grey darken-2">{{tabsMap[item.tab] || '未知'}}</v-chip> • {{item.author.loginname}} • {{item.reply_count}} 条回复 • {{item.create_at | timeFormattor}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
            <div v-if="tabsData[item.category].length > 0" class="loading text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                v-show="tabsState[item.category].showGetMoreLoading"
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

.tab-item-wrap
  -webkit-overflow-scrolling: touch
</style>


<script>
import TABS from '@/data/tabs'
import TABS_MAP from '@/data/tabs-map'
import throttle from 'lodash/throttle'

const NUM_PER_PAGE = 20

let primaryData = {
  currTab: 0,
  tabs: TABS,
  tabsMap: TABS_MAP,
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
  computed: {
    currCategory () {
      return this.tabs[this.currTab].category
    },
    currTabData () {
      return this.tabsData[this.currCategory]
    }
  },
  created () {
    this.accessToken = this.$localStorage.get('accessToken')
    if (this.accessToken) {
      this.getUnreadCount()
    }

    let selectedTabs = this.$localStorage.get('selectedTabs')
    if (selectedTabs) {
      this.updateTabs(selectedTabs.split(','))
    } else {
      // 最多显示5个tab
      this.tabs = TABS.slice(0, 5)
      this.$localStorage.set('selectedTabs', Object.keys(TABS_MAP).slice(0, 5).join(','))
    }

    if (this.currTabData.length === 0) {
      this.getTabListData()
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

        this.tabs.forEach(tab => {
          let el = this.$refs[`tab_item_${tab.category}`][0].$el
          el.style['height'] = listViewHeight + 'px'
          el.style['overflow-y'] = 'auto'
        })
      }
    },
    onTabChange () {
      if (this.currTabData.length === 0) {
        this.getTabListData()
      }
    },
    getTabListData () {
      this.showRefreshLoading = true
      this.ajax('/topics', {
        params: {
          tab: this.currCategory === 'all' ? '' : this.currCategory,
          limit: NUM_PER_PAGE,
          page: 1
        }
      })
        .then(data => {
          if (data.success) {
            this.tabsData[this.currCategory] = data.data
            this.$nextTick(() => {
              this.cacheTopics(data.data)
            })
          }
        })
        .finally(() => {
          this.showRefreshLoading = false
        })
    },
    onTabListScroll: throttle(function (category) {
      let el = this.$refs[`tab_item_${category}`][0].$el
      let list = el.children[0]
      if (Math.round(el.scrollTop) >= list.offsetHeight - listViewHeight) {
        let state = this.tabsState[category]
        state.showGetMoreLoading = true
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
    }, 100),
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
    },
    updateTabs (selects) {
      let newTabs = []
      TABS.forEach(item => {
        if (selects.indexOf(item.category) > -1) {
          newTabs.push(item)
        }
      })
      this.tabs = newTabs
      this.$localStorage.set('selectedTabs', selects.join(','))
    },
    onTabClick (tab, index) {
      if (index === this.currTab) {
        let listWrap = this.$refs[`tab_item_${tab.category}`][0].$el
        listWrap.scrollTop = 0
        this.getTabListData()
      }
    }
  }
}
</script>

