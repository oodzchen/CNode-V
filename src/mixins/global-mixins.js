import axios from 'axios'
import bus from '@/utils/bus'

export default {
  // data () {
  //   return {
  //     themeColor: 'primary'
  //   }
  // },
  methods: {
    async ajax (path, options) {
      let config = Object.assign({
        url: path,
        baseURL: 'https://cnodejs.org/api/v1'
      }, options)

      if (config.method && config.method.toLowerCase() === 'post') {
        config.headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }

      if (config.data) {
        config.data = Object.keys(config.data).map(key => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(config.data[key])
        }).join('&')
      }

      if (config.showloading) {
        this.showPageLoading()
      }

      let response = await axios(config)
        .catch(e => {
          if (e) {
            let data = e.response.data
            if (data && data.error_msg) {
              this.alert('error', data.error_msg)
            } else {
              this.alert('error', '请求失败')
            }
            throw new Error(e)
          }
        }).finally((res) => {
          this.hidePageLoading()
        })

      if (!response.data.success) {
        this.alert('error', response.data.error_msg)
        return null
      }

      return response.data
    },
    alert (type, text) {
      // bus.$emit('snackshow', type, text)
      this.$store.commit('CHANGE_SNACK', {
        show: true,
        type: type,
        text: text
      })
    },
    showPageLoading () {
      bus.$emit('showloading')
    },
    hidePageLoading () {
      bus.$emit('hideloading')
    },
    getToken (callbackUrl, addHistory) {
      let token = this.$localStorage.get('accessToken')
      if (token) {
        return token
      } else {
        let path = `/login?redirect=${encodeURIComponent(callbackUrl)}`
        if (addHistory) {
          this.$router.push(path)
        } else {
          this.$router.replace(path)
        }
      }
    },
    findClosestComponentByClass (className) {
      if (this === this.$root) return null

      if (this.$parent.$el.classList.contains(className)) {
        return this.$parent
      } else {
        return this.$parent.findClosestComponentByClass(className)
      }
    }
  }
}
