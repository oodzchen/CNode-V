<template>
  <page-container :show-bottom-nav="false" @loginuser="onLoginUser">
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-times</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if="currTopic.is_collect" icon @click="cancelCollectTopic">
        <v-icon>fas fa-bookmark</v-icon>
      </v-btn>
      <v-btn v-else icon @click="collectTopic">
        <v-icon>far fa-bookmark</v-icon>
      </v-btn>
      <v-menu v-if="loginUser && currTopic.author && currTopic.author.loginname === loginUser.loginname" bottom left>
        <v-btn
          slot="activator"
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
    </template>

    <div class="topic-wrap">
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
              </router-link> • 发布于{{currTopic.create_at | timeFormattor}} • {{currTopic.visit_count}}次浏览 • 来自{{tabsMap[currTopic.tab] || '未知'}}
            </div>
          </div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text v-html="currTopic.content"></v-card-text>
      </v-card>
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
      <div 
        class="loading text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          v-show="showRepliesLoading"
        ></v-progress-circular>
        <div v-if="!showRepliesLoading && currTopic.replies && currTopic.replies.length === 0" class="grey--text">暂无评论</div>
      </div>
    </div>

    <v-card flat class="reply-entry" @click.prevent="doReply()">
      <v-text-field
        readonly
        placeholder="添加评论"
        single-line
        hide-details
      ></v-text-field>
    </v-card>

    <v-dialog 
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      v-model="reply">
      <v-card flat>
        <v-toolbar dark :color="themeColor" fixed>
          <v-btn icon @click="$router.go(-1)">
            <v-icon>fa-arrow-left</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click="sendReply">
            <v-icon>fa-paper-plane</v-icon>
          </v-btn>
        </v-toolbar>
        <v-content>
          <div class="reply-topic-title">{{currTopic.title}}</div>
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
        </v-content>
      </v-card>
    </v-dialog>
  </page-container>
</template>

<style lang="stylus">
.topic-wrap
  padding-bottom: 50px

.topic
.replies
  .v-card__text img
    max-width: 100%
  
  .markdown-text
    word-break: break-all
    code
    kbd
      padding-left: 7px
      padding-right: 7px
      max-width: 100%
      overflow: auto
      white-space: unset


.replies-top
  padding: 10px 16px

.replies
  .v-card__title
    padding-top: 5px
    padding-bottom 5px
  
  .v-card__text
    padding-top: 5px
    padding-bottom: 5px

  .markdown-text p:last-child
    margin-bottom: 0

.v-card.reply-entry
  position: fixed
  left: 0
  bottom: 0
  width: 100%
  padding: 8px 16px
  box-shadow: 0 -2px 2px rgba(0, 0, 0, 0.2)
  .v-text-field
    padding: 0
    margin: 0

.reply-topic-title
  padding: 16px
</style>


<script>
import TABS_MAP from '@/data/tabs-map'

export default {
  props: [ 'id', 'reply' ],
  data () {
    return {
      valid: true,
      currTopic: {},
      showRepliesLoading: false,
      tabsMap: TABS_MAP,
      accessToken: null,
      replyContent: '',
      replyRules: [
        v => !!v || '内容不能为空'
      ],
      replyToUserId: '',
      replyToReplyId: '',
      loginUser: null
    }
  },
  watch: {
  },
  created () {
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
        this.replyToUserId = item.author.loginname
        this.replyToReplyId = item.id
        this.replyContent = `@${this.replyToUserId} `
      } else {
        this.replyToUserId = ''
        this.replyToReplyId = ''
        this.replyContent = ''
      }
      this.$router.push(`/topic/${this.id}/reply`)
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

        if (this.replyToReplyId) {
          config.data.reply_id = this.replyToReplyId
        }

        this.ajax(`/topic/${this.id}/replies`, config)
          .then(data => {
            if (data.success) {
              this.$router.go(-1)
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

