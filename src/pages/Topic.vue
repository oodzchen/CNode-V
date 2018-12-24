<template>
  <page-container :show-bottom-nav="false" @loginuser="onLoginUser">
    <v-toolbar color="primary" fixed class="page-toolbar">
      <v-btn icon dark @click="$router.go(-1)">
        <v-icon>fa-times</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if="currTopic.is_collect" icon dark @click="cancelCollectTopic">
        <v-icon>fas fa-bookmark</v-icon>
      </v-btn>
      <v-btn v-else icon dark @click="collectTopic">
        <v-icon>far fa-bookmark</v-icon>
      </v-btn>
      <v-menu v-if="loginUser && currTopic.author && currTopic.author.loginname === loginUser.loginname" bottom left>
        <v-btn
          slot="activator"
          dark
          icon
        >
          <v-icon>fa-ellipsis-v</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile :to="`/topic/${id}/edit`">
            <v-list-tile-title>编辑</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>

    <v-card flat class="topic" @click="clickInject">
      <v-card-title primary-title>
        <div>
          <h3 class="headline">
            {{currTopic.title}}
          </h3>
          <div class="grey--text" v-if="currTopic.author">
            <router-link tag="span" :to="`/user/${currTopic.author.loginname}`">
              <v-avatar size="24">
                <img :src="currTopic.author.avatar_url">
              </v-avatar> {{currTopic.author.loginname}}
            </router-link> • 发布于{{currTopic.create_at | timeFormattor}} • {{currTopic.visit_count}}次浏览 • 来自{{tabsMap[currTopic.tab]}}
          </div>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text v-html="currTopic.content"></v-card-text>
    </v-card>

    <div 
      class="loading text-center"
      v-show="showRepliesLoading"
    >
      <v-progress-circular
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>

    <v-card 
      v-if="currTopic.replies && currTopic.replies.length" 
      flat 
      class="replies"
      @click="clickInject"
    >
      <v-divider></v-divider>
      <div class="replies-top">回复 {{currTopic.reply_count}}</div>
      <template v-for="(reply, index) in currTopic.replies">
        <v-divider :key="`${index}_divider`"></v-divider>
        <v-card flat :key="`${index}_reply`">
          <v-card-title>
            <div class="grey--text">
              <router-link tag="span" :to="`/user/${reply.author.loginname}`">
                <v-avatar size="24">
                  <img :src="reply.author.avatar_url">
                </v-avatar> {{reply.author.loginname}}
              </router-link> • {{reply.create_at | timeFormattor}}
            </div>
          </v-card-title>
          <v-card-text v-html="reply.content"></v-card-text>
          <v-card-actions class="grey--text">
            <v-spacer></v-spacer>
            <v-btn icon flat color="grey" @click="doReply(reply)">
              <v-icon>fa-reply</v-icon>
            </v-btn>
            <v-btn 
              icon 
              flat 
              :color="reply.is_uped ? 'primary' : 'grey'"
              @click="upReplay(reply)"
            >
              <v-icon>fa-thumbs-up</v-icon>
            </v-btn> {{reply.ups.length}}
          </v-card-actions>
        </v-card>
      </template>
    </v-card>

    <div class="reply-entry">
      <v-text-field 
        label="添加评论" 
        outline
        single-line
        readonly
        hide-details
        height="20"
        @click.prevent="doReply(null)"
      ></v-text-field>
    </div>

    <v-dialog 
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-model="showReplyDialog">
      <v-card flat>
        <v-toolbar color="primary" fixed class="page-toolbar">
          <v-btn icon dark @click="showReplyDialog = !showReplyDialog">
            <v-icon>fa-times</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn dark icon @click="sendReply">
            <v-icon>fa-paper-plane</v-icon>
          </v-btn>
        </v-toolbar>
        <div class="reply-box">
          <p>{{currTopic.title}}</p>
          <v-divider></v-divider>
          <v-form v-model="valid" ref="form">
            <v-textarea 
              flat
              v-model="replyContent" 
              :rules="replyRules"
              solo 
              label="你的回复"
              no-resize
              required
              autofocus
            ></v-textarea>
          </v-form>
        </div>
      </v-card>
    </v-dialog>
  </page-container>
</template>

<style lang="stylus">
.topic
.replies
  .v-card__text img
    max-width: 100%
  
  .markdown-text
    word-break: break-all
    code
      padding-left: 7px
      padding-right: 7px
      max-width: 100%
      overflow: auto


.replies-top
  padding: 10px 16px

.replies
  padding-bottom: 60px
  .v-card__title
    padding-top: 5px
    padding-bottom 5px
  
  .v-card__text
    padding-top: 5px
    padding-bottom: 5px

  .markdown-text p:last-child
    margin-bottom: 0

.reply-entry
  position: fixed
  left: 0
  bottom: 0
  width: 100%
  background-color: #f8f8f8
  padding: 10px
  .v-input__control
    background-color: white
  .v-input__slot
    border-width: 1px !important
    border-color: #ccc !important

.reply-box
  padding: 15px;

  .v-divider
    padding-bottom: 16px
</style>


<script>
import TABS from '@/data/tabs'

let tabsMap = {}

TABS.forEach(item => {
  tabsMap[item.category] = item.name
})

export default {
  props: [ 'id' ],
  data () {
    return {
      valid: true,
      currTopic: {},
      showRepliesLoading: false,
      tabsMap: tabsMap,
      accessToken: null,
      showReplyDialog: false,
      replyContent: '',
      replyRules: [
        v => !!v || '内容不能为空'
      ],
      replyToId: '',
      loginUser: null
    }
  },
  created () {
    // if (this.$localStorage.get(`topic_${this.id}`)) {
    //   this.currTopic = JSON.parse(this.$localStorage.get(`topic_${this.id}`))
    // }
    this.accessToken = this.$localStorage.get('accessToken')
    this.currTopic = this.getTopicFromCache(this.id)
    this.getTopic()
  },
  methods: {
    onLoginUser (data) {
      this.loginUser = data
    },
    getTopic (item) {
      if (!this.currTopic.replies) {
        this.showRepliesLoading = true
      }

      let config = {
        params: {}
      }

      if (this.accessToken) {
        config.params.accesstoken = this.accessToken
      }

      this.ajax(`/topic/${this.id}`, config)
        .then(data => {
          if (data.success) {
            this.currTopic = data.data
            this.$localStorage.set(`topic_${this.id}`, JSON.stringify(data.data))
          }
        })
        .finally(() => {
          this.showRepliesLoading = false
        })
    },
    collectTopic () {
      this.accessToken = this.getToken(this.$route.path, true)

      if (!this.accessToken) return

      this.ajax('/topic_collect/collect', {
        method: 'post',
        data: {
          accesstoken: this.accessToken,
          topic_id: this.id
        }
      }).then(data => {
        if (data.success) {
          this.currTopic.is_collect = true
        }
      })
    },
    cancelCollectTopic () {
      this.accessToken = this.getToken(this.$route.path, true)

      if (!this.accessToken) return

      this.ajax('/topic_collect/de_collect', {
        method: 'post',
        data: {
          accesstoken: this.accessToken,
          topic_id: this.id
        }
      }).then(data => {
        if (data.success) {
          this.currTopic.is_collect = false
        }
      })
    },
    upReplay (item) {
      this.accessToken = this.getToken(this.$route.path, true)

      if (!this.accessToken) return

      this.ajax(`/reply/${item.id}/ups`, {
        method: 'post',
        data: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        if (data.success) {
          if (item.is_uped) {
            item.is_uped = false
            item.ups.pop()
          } else {
            let loginUserId = this.$localStorage.get('loginUserId')
            item.is_uped = true
            item.ups.push(loginUserId)
          }
        }
      })
    },
    doReply (item) {
      this.accessToken = this.getToken(this.$route.path, true)

      if (!this.accessToken) return

      if (item) {
        this.replyToId = item.author.loginname
        this.replyContent = `@${this.replyToId} `
      } else {
        this.replyToId = ''
        this.replyContent = ''
      }
      this.showReplyDialog = true
    },
    sendReply () {
      if (this.$refs.form.validate()) {
        let config = {
          method: 'post',
          showloading: true,
          data: {
            accesstoken: this.accessToken,
            content: this.replyContent
          }
        }

        if (this.replyToId) {
          config.data.reply_id = this.replyToId
        }

        this.ajax(`/topic/${this.id}/replies`, config)
          .then(data => {
            if (data.success) {
              this.showReplyDialog = false
              this.getTopic()
            }
          })
      }
    },
    clickInject (e) {
      if (e.target.tagName.toLowerCase() === 'a') {
        if (e.target.origin === window.location.origin) {
          e.preventDefault()
          this.$router.push(e.target.pathname)
        }
      }
    },
    getTopicFromCache (id) {
      let data = this.$localStorage.get(`topic_${id}`)
      return data ? JSON.parse(data) : {}
    }
  }
}
</script>

