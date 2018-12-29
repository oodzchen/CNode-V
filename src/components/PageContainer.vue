<template>
  <div class="page-container">
    <v-navigation-drawer
      v-if="drawer"
      app
      left
      v-model="showDrawer"
    >
      <v-list class="drawer-list">
        <div class="drawer-user">
          <template v-if="loginUser">
            <router-link tag="div" :to="`/user/${loginUser.loginname}`">
              <v-avatar >
                <img :src="loginUser.avatar_url">
              </v-avatar>
            </router-link>
            <h3>{{loginUser.loginname}}</h3>
            <p class="grey--text">积分 {{loginUser.score}} • 注册于 {{loginUser.create_at | timeFormattor}}</p>
          </template>
          <template v-else>
            <v-btn icon to="/login">
              <v-icon size="50">fa-user</v-icon>
            </v-btn>
            <div>登录后可进行发帖、评论、点赞等操作</div>
          </template>
        </div>
        <v-divider></v-divider>
        <v-list-tile v-if="loginUser" :to="`/user/${loginUser.loginname}`">
          <v-list-tile-action><v-icon>fa-user</v-icon></v-list-tile-action>
          <v-list-tile-content>个人中心</v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-else to="/login">
          <v-list-tile-action><v-icon>fa-sign-in-alt</v-icon></v-list-tile-action>
          <v-list-tile-content>登录</v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/settings">
          <v-list-tile-action><v-icon>fa-cog</v-icon></v-list-tile-action>
          <v-list-tile-content>设置</v-list-tile-content>
        </v-list-tile>
        <v-list-tile href="https://github.com/oodzchen/CNode-PWA/issues/new">
          <v-list-tile-action><v-icon>fa-comment-alt</v-icon></v-list-tile-action>
          <v-list-tile-content>反馈</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action><v-icon>fa-moon</v-icon></v-list-tile-action>
          <v-list-tile-content @click="nightMode = !nightMode">夜间模式</v-list-tile-content>
          <v-list-tile-action>
            <v-switch
              v-model="nightMode"
              hide-details
            ></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar 
      app
      dark
      :scroll-off-screen="isHome"
      :tabs="isHome"
      :color="themeColor"
      :key="$route.fullPath">
      <slot name="toolbar"></slot>
      <slot name="toolbar-extension" slot="extension"></slot>
    </v-toolbar>
    <v-content>
      <slot></slot>
    </v-content>
    <div class="page-loading text-center" v-show="loading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
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

.drawer-list
  .v-input--selection-controls
    margin: 0
    padding: 0
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
    },
    isHome: {
      default: false,
      type: Boolean
    }
  },
  name: 'page-container',
  data () {
    return {
      loading: false,
      showDrawer: false,
      accessToken: null,
      loginUserId: null,
      loginUser: null,
      nightMode: false
    }
  },
  watch: {
    nightMode (newVal) {
      let color = newVal ? 'dark' : 'primary'
      this.themeColor = color
      this.$localStorage.set('themeColor', color)
      bus.$emit('themecolor', color)
    }
  },
  created () {
    this.themeColor = this.$localStorage.get('themeColor') || 'primary'
    bus.$on('themecolor', color => { this.themeColor = color })
    if (this.themeColor === 'dark') {
      this.nightMode = true
    }

    this.accessToken = this.$localStorage.get('accessToken')
    let loginUser = this.$localStorage.get('loginUser')
    if (this.accessToken) {
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
  }
}
</script>

