<template>
  <page-container>
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="sendReply">
        <v-icon>fa-paper-plane</v-icon>
      </v-btn>
    </template>
    <div class="reply-topic-title">{{topicTitle}}</div>
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
  </page-container>
</template>

<style lang="stylus">
.reply-topic-title
  padding: 16px
</style>


<script>
export default {
  props: ['topicTitle', 'content', 'toReplyId'],
  data () {
    return {
      valid: true,
      replyContent: '',
      replyRules: [
        v => !!v || '内容不能为空'
      ]
    }
  },
  watch: {
    content (newVal) {
      this.replyContent = newVal
    }
  },
  methods: {
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

        if (this.toReplyId) {
          config.data.reply_id = this.toReplyId
        }

        this.ajax(`/topic/${this.id}/replies`, config)
          .then(data => {
            if (data.success) {
              this.$router.go(-1)
              this.getTopic()
            }
          })
      }
    }
  }
}
</script>

