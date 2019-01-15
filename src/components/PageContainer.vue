<template>
  <div class="page-container">
    <v-navigation-drawer
      v-if="drawer"
      app
      temporary
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
        <v-list-tile target="_blank" href="https://github.com/oodzchen/CNode-V/issues/new">
          <v-list-tile-action><v-icon>fa-comment-alt</v-icon></v-list-tile-action>
          <v-list-tile-content>反馈</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-action><v-icon>fa-moon</v-icon></v-list-tile-action>
          <v-list-tile-content @click="toggleNightMode">夜间模式</v-list-tile-content>
          <v-list-tile-action>
            <v-switch
              :value="nightMode"
              @change="toggleNightMode"
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
    <v-content
    >
      <slot></slot>
    </v-content>
    
  </div>
</template>

<style lang="stylus">
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
      loginUser: null
    }
  },
  computed: {
    themeColor () {
      return this.$store.state.themeColor
    },
    nightMode () {
      return this.$store.getters.nightMode
    }
  },
  created () {
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
  },
  methods: {
    toggleDrawer () {
      this.showDrawer = !this.showDrawer
    },
    toggleNightMode () {
      let color = this.themeColor === 'dark' ? 'primary' : 'dark'
      this.$store.commit('CHANGE_THEME', color)
    }
  }
}
</script>

