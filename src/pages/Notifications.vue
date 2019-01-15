<template>
  <page-container drawer ref="container" @loginuser="data => loginUser = data">
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>提醒</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="markAllAsRead" :disabled="unreadMsgs.length === 0">
        <v-icon>fa-check-double</v-icon>
      </v-btn>
    </template>
    <v-list v-if="allMessages.length" three-line class="tab-list noties-list">
      <template v-for="(item, index) in allMessages">
        <v-divider v-if="index !== 0" :key="index + '_divider'"></v-divider>
        <v-list-tile 
          :key="index + '_tile'" 
          :class="{read: item.has_read}"
          :to="`/topic/${item.topic.id}`"
          @click="markAsRead(item, index)"
        >
          <v-list-tile-avatar>
            <img :src="item.author.avatar_url">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>
              {{item.author.loginname}}
              <template v-if="item.type === 'reply'">回复了你的主题 <b>{{item.topic.title}}</b></template>
              <template v-else-if="item.type === 'at'">在主题 <b>{{item.topic.title}}</b> 中提到了你</template>
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{item.create_at | timeFormattor}}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
    <div class="loading text-center">
      <v-progress-circular v-show="showGetNotiesLoading" indeterminate color="primary"></v-progress-circular>
      <div v-show="!showGetNotiesLoading && unreadMsgs.length === 0 && readMsgs.length === 0" class="grey--text">
        暂无内容
      </div>
    </div>
  </page-container>
</template>

<style lang="stylus">
.noties-list
  .read
    opacity: .6
</style>


<script>
import { mapState } from 'vuex'

export default {
  data () {
    return {
      accessToken: null,
      showGetNotiesLoading: false,
      loginUser: null
    }
  },
  computed: {
    ...mapState([
      'readMsgs',
      'unreadMsgs'
    ]),
    allMessages () {
      return [...this.unreadMsgs, ...this.readMsgs]
    }
  },
  created () {
    this.accessToken = this.getToken(this.$route.path)

    if (this.accessToken) {
      this.getNoties()
    }
  },
  methods: {
    getNoties () {
      this.showGetNotiesLoading = true
      this.ajax('/messages', {
        params: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        if (data.success) {
          this.$store.commit('UPDATE_MSGS', {
            read: data.data.has_read_messages,
            unread: data.data.hasnot_read_messages
          })
        }
      }).finally(() => {
        this.showGetNotiesLoading = false
      })
    },
    markAllAsRead () {
      if (this.unread.length === 0) return

      this.ajax('/message/mark_all', {
        showloading: true,
        method: 'post',
        data: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        if (data.success) {
          this.$store.commit('READ_ALL_MSGS')
        }
      })
    }
  }
}
</script>

