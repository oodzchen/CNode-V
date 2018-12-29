<template>
  <page-container>
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-times</v-icon>
      </v-btn>
    </template>
    <!-- <qrcode-stream @decode="onDecode" @init="onInit" /> -->
    <qrcode-drop-zone @decode="onDecode" @init="logErrors">
      <qrcode-stream @decode="onDecode" @init="onInit" />
    </qrcode-drop-zone>
    <qrcode-capture v-if="noStreamApiSupport" @decode="onDecode" />
  </page-container>
</template>

<script>
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'

export default {
  data () {
    return {
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
      this.$router.go(-1)
      this.$emit('cameradecode', result)
    },
    logErrors (promise) {
      this.$router.go(-1)
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

        this.$router.go(-1)

        this.$emit('cameraerror', this.error)
      }
    }
  }
}
</script>

