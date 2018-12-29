<template>
  <div>
    <page-container>
      <template slot="toolbar">
        <v-btn icon @click="$router.go(-1)">
          <v-icon>fa-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>登录</v-toolbar-title>
      </template>
      <v-card flat class="text-center">
        <v-card-text>  
          <v-btn icon fab color="primary" to="/login/camera">
            <v-icon>fa-camera</v-icon>
          </v-btn>
          <v-text-field v-model="accessToken" label="输入Access Token"></v-text-field>
          <v-btn 
            block 
            :disabled="accessToken.length === 0"
            color="primary"
            @click="login"
          >登录</v-btn>
        </v-card-text>
      </v-card>
    </page-container>
    <v-dialog
      v-model="camera"
      hide-overlay
      :transition="false"
      fullscreen>
      <v-card flat>
        <login-camera
          v-if="camera"
          @cameraerror="onCameraError"
          @cameradecode="onCameraDecod"></login-camera>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import LoginCamera from './LoginCamera'

export default {
  props: {
    redirect: {
      default: '',
      type: String
    },
    camera: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      accessToken: ''
    }
  },
  components: {
    LoginCamera
  },
  methods: {
    login () {
      if (this.accessToken.trim().length === 0) return

      this.ajax('/accesstoken', {
        method: 'post',
        showloading: true,
        data: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        if (data.success) {
          this.$localStorage.set('accessToken', this.accessToken)
          this.$localStorage.set('loginUserId', data.loginname)

          if (this.redirect) {
            this.$router.replace(this.redirect)
          } else {
            this.$router.replace('/')
          }
        }
      })
    },
    onCameraDecod (result) {
      this.accessToken = result
      this.login()
    },
    onCameraError (err) {
      this.alert('error', err)
    }
  }
}
</script>

