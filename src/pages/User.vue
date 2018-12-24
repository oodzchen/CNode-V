<template>
  <page-container @loginuser="onLoginUser">
    <v-toolbar color="primary" fixed dark class="page-toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title v-if="isAccount">账户信息</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isAccount && accessToken" icon to="/settings">
        <v-icon>fa-cog</v-icon>
      </v-btn>
    </v-toolbar>

    <v-card flat class="user-card text-center">
      <v-progress-circular
        v-if="Object.keys(user).length === 0"
        indeterminate
        color="primary"
        v-show="showGetUserLoading"
      ></v-progress-circular>
      <template v-else>
        <v-avatar>
          <img :src="user.avatar_url">
        </v-avatar>
        <h3>{{user.loginname}}</h3>
        <p class="grey--text">积分 {{user.score}} • 注册于 {{user.create_at | timeFormattor}}</p>
        <p>
          <v-icon>fab fa-github</v-icon> <a :href="`https://github.com/${user.githubUsername}`">{{user.githubUsername}}</a>
        </p>
      </template>
    </v-card>

    <v-tabs v-model="currTab" grow color="transparent">
      <v-tab v-for="item in tabs" :key="item.category">{{item.name}}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="currTab">
      <v-tab-item
        v-for="(data, category) in tabsData"
        :key="category"
      >
        <v-list three-line class="tab-list">
          <template v-for="(item, index) in data">
            <v-divider v-if="index !== 0" :key="index + '_divider'"></v-divider>
            <v-list-tile :key="index + '_tile'">
              <v-list-tile-content>
                <router-link tag="div" :to="`/topic/${item.id}`">
                  <v-list-tile-title>{{item.title}}</v-list-tile-title>
                </router-link>
                <v-list-tile-sub-title>
                  <v-avatar size="24">
                    <img :src="item.author.avatar_url">
                  </v-avatar>
                  {{item.author.loginname}} • 最后回复于{{item.last_reply_at | timeFormattor}}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
          <div v-if="category !== 'collect_topics'" class="loading text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              v-show="showGetUserLoading"
            ></v-progress-circular>
            <div v-show="!showGetUserLoading && data.length === 0" class="grey--text">
              暂无内容
            </div>
          </div>
          <div v-else class="loading text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              v-show="showGetCollectLoading"
            ></v-progress-circular>
            <div v-show="!showGetCollectLoading && data.length === 0" class="grey--text">
              暂无内容
            </div>
          </div>
        </v-list>
      </v-tab-item>
    </v-tabs-items>
  </page-container>
</template>

<style lang="stylus">
.user-card
  min-height: 180px
  padding: 15px 0
</style>


<script>
const TABS = [
  {
    category: 'recent_topics',
    name: '话题'
  },
  {
    category: 'recent_replies',
    name: '回复'
  },
  {
    category: 'collect_topics',
    name: '收藏'
  }
]

let primaryData = {
  user: {},
  currTab: null,
  tabs: TABS,
  tabsData: {},
  showGetUserLoading: false,
  showGetCollectLoading: false,
  loginUserId: null,
  accessToken: null,
  loginUser: null
}

primaryData.tabs.forEach(tab => {
  primaryData.tabsData[tab.category] = []
})

export default {
  props: ['id', 'isAccount'],
  data () {
    return primaryData
  },
  created () {
    if (this.isAccount) {
      this.accessToken = this.getToken(this.$route.path)
      this.loginUserId = this.$localStorage.get('loginUserId')
      if (this.accessToken && this.loginUserId) {
        this.getUserData(this.loginUserId)
      }
    } else {
      this.getUserData(this.id)
    }
  },
  beforeDestroy () {
    this.user = {}
  },
  methods: {
    onLoginUser (data) {
      if (!this.isAccount && data.loginname === this.id) {
        this.$router.replace('/account')
      }
    },
    getUserData (id) {
      this.showGetUserLoading = true
      this.ajax(`/user/${id}`)
        .then(data => {
          this.user = data.data

          for (let key in this.tabsData) {
            if (this.user[key]) {
              this.tabsData[key] = this.user[key]
            }
          }
        })
        .finally(() => {
          this.showGetUserLoading = false
        })

      this.getColletTopics(id)
    },
    getColletTopics (id) {
      this.showGetCollectLoading = true
      this.ajax(`/topic_collect/${id}`)
        .then(data => {
          this.tabsData.collect_topics = data.data
        })
        .finally(() => {
          this.showGetCollectLoading = false
        })
    }
  }
}
</script>

