<template>
  <page-container>
    <v-toolbar dark color="primary" fixed class="page-toolbar">
      <v-btn icon dark @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>登录</v-toolbar-title>
    </v-toolbar>
    <v-card flat class="login text-center">
      <v-card-text>  
        <v-btn icon fab color="primary" @click="showCamera = true">
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

    <v-dialog 
      v-if="showCamera" 
      v-model="showCamera"
      fullscreen>
      <v-card flat>
        <v-toolbar color="primary" fixed class="page-toolbar">
          <v-btn icon dark @click="showCamera = false">
            <v-icon>fa-times</v-icon>
          </v-btn>
        </v-toolbar>
        <!-- <qrcode-stream @decode="onDecode" @init="onInit" /> -->
        <qrcode-drop-zone @decode="onDecode" @init="logErrors">
          <qrcode-stream @decode="onDecode" @init="onInit" />
        </qrcode-drop-zone>

        <qrcode-capture v-if="noStreamApiSupport" @decode="onDecode" />
      </v-card>
    </v-dialog>
  </page-container>
</template>

<style lang="stylus">
.login
  padding: 15px 0
</style>

<script>
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'

export default {
  props: ['redirect'],
  data () {
    return {
      accessToken: '',
      showCamera: false,
      error: '',
      noStreamApiSupport: false
    }
  },
  components: {
    QrcodeStream,
    QrcodeDropZone,
    QrcodeCapture
  },
  methods: {
    onDecode (result) {
      console.log(result)
      this.showCamera = false
      this.accessToken = result
      this.login()
    },
    logErrors (promise) {
      this.showCamera = false
      promise.catch(console.error)
    },
    async onInit (promise) {
      try {
        await promise
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = 'ERROR: 你需要授予相机权限'
        } else if (error.name === 'NotFoundError') {
          this.error = 'ERROR: 此设备没有相机'
        } else if (error.name === 'NotSupportedError') {
          this.error = 'ERROR: 必须为安全环境 (HTTPS, localhost)'
        } else if (error.name === 'NotReadableError') {
          this.error = 'ERROR: 相机是否被占用?'
        } else if (error.name === 'OverconstrainedError') {
          this.error = 'ERROR: 当前相机不匹配'
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.noStreamApiSupport = true
          this.error = 'ERROR: 当前浏览器不支持Stream Api'
        }

        this.showCamera = false

        this.alert('error', this.error)
      }
    },
    login () {
      if (this.accessToken.trim().length === 0) return

      this.$localStorage.set('accessToken', this.accessToken)

      this.ajax('/accesstoken', {
        method: 'post',
        showloading: true,
        data: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        this.$localStorage.set('loginUserId', data.loginname)
        console.log('redirect: ', this.redirect)
        if (this.redirect) {
          this.$router.replace(this.redirect)
        } else {
          this.$router.replace('/')
        }
      })
    }
  }
}
</script>

