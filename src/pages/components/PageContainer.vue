<template>
  <div class="page-container">
    <slot></slot>
    <v-navigation-drawer
      v-if="drawer"
      app
      left
      v-model="showDrawer"
    >
      <v-list>
        <template v-if="loginUser">
          <div class="drawer-user">
            <router-link tag="div" to="/account">
              <v-avatar >
                <img :src="loginUser.avatar_url">
              </v-avatar>
            </router-link>
            <h3>{{loginUser.loginname}}</h3>
            <p class="grey--text">积分 {{loginUser.score}} • 注册于 {{loginUser.create_at | timeFormattor}}</p>
          </div>
          <v-divider></v-divider>
        </template>
        <template v-else>
          <div class="drawer-user">
            <v-btn icon to="/login">
              <v-icon size="50">fa-user</v-icon>
            </v-btn>
            <div>登录后可进行发帖、评论、点赞等操作</div>
          </div>
          <v-divider></v-divider>
          <v-list-tile to="/login">
            <v-list-tile-action><v-icon>fa-sign-in-alt</v-icon></v-list-tile-action>
            <v-list-tile-content>登录</v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
      <v-layout justify-space-between class="drawer-btm">
        <v-btn flat left to="/settings" class="btn-settings">
          <v-icon color="grey">fa-cog</v-icon> 设置
        </v-btn>
        <!-- <v-btn icon>
          <v-icon color="grey">fa-moon</v-icon>
        </v-btn> -->
      </v-layout>
    </v-navigation-drawer>

    <div class="page-loading text-center" v-show="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- <v-bottom-nav 
      v-show="showBottomNav"
      fixed
      app
      :value="true"
      :active.sync="currNav"
    >
      <v-btn value="home" to="/" exact>
        <v-icon>fa-home</v-icon>
      </v-btn>
      <v-btn value="search" to="/search">
        <v-icon>fa-search</v-icon>
      </v-btn>
      <v-btn value="new" to="/new">
        <v-icon>fa-plus-circle</v-icon>
      </v-btn>
      <v-btn value="notifications" to="/notifications">
        <v-badge
          overlap
          color="red"
        >
          <span v-if="unreadCount > 0" slot="badge">{{unreadCount}}</span>
          <v-icon>fa-bell</v-icon>
        </v-badge>
      </v-btn>
      <v-btn value="account" to="/account">
        <v-icon>fa-user</v-icon>
      </v-btn>
    </v-bottom-nav> -->
  </div>
</template>

<style lang="stylus">
.page-loading
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)

  .v-progress-circular
    background-color: white;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5)

.drawer-user
  padding: 15px
  text-align: center
  .v-btn
    display: block
    width: 50px
    height: 50px
    margin: 0 auto 15px

.drawer-btm
  position: absolute
  bottom: 0
  left: 0
  width: 100%
  .btn-settings
    padding-left: 0
    margin-left: 0
    text-align: left
    .v-btn__content
      justify-content: left
    .v-icon
      margin-right: 10px
</style>

<script>
import bus from '@/utils/bus'

export default {
  props: {
    showBottomNav: {
      default: true,
      type: Boolean
    },
    drawer: {
      default: false,
      type: Boolean
    }
  },
  name: 'page-container',
  data () {
    return {
      // navigations: ['home', 'search', 'new', 'notifications', 'account'],
      currNav: null,
      loading: false,
      showDrawer: false,
      accessToken: null,
      loginUserId: null,
      loginUser: null
      // unreadCount: 0
    }
  },
  created () {
    if (this.currNav === null) {
      let path = this.$route.path.match(/^\/(\w+)(\/|$)/)

      if (path) {
        this.currNav = path[1]
      } else {
        this.currNav = 'home'
      }
    }

    this.accessToken = this.$localStorage.get('accessToken')
    let loginUser = this.$localStorage.get('loginUser')

    if (this.accessToken) {
      // this.getUnreadCount()

      if (loginUser) {
        this.loginUser = JSON.parse(loginUser)
        this.$emit('loginuser', this.loginUser)
      } else {
        this.loginUserId = this.$localStorage.get('loginUserId')
        if (this.loginUserId) {
          this.ajax(`/user/${this.loginUserId}`)
            .then(data => {
              if (data.success) {
                this.loginUser = data.data
                this.$emit('loginuser', this.loginUser)
                this.$localStorage.set('loginUser', JSON.stringify(data.data))
              }
            })
        }
      }
    }

    bus.$on('showloading', this.showLoading.bind(this))
    bus.$on('hideloading', this.hideLoading.bind(this))
  },
  beforeDestroy () {
    this.hideLoading()
  },
  methods: {
    showLoading () {
      this.loading = true
    },
    hideLoading () {
      this.loading = false
    },
    toggleDrawer () {
      this.showDrawer = !this.showDrawer
    }
    // getUnreadCount () {
    //   this.ajax('/message/count', {
    //     params: {
    //       accesstoken: this.accessToken
    //     }
    //   }).then(data => {
    //     if (data.success) {
    //       this.unreadCount = data.data
    //     }
    //   })
    // }
  }
}
</script>

