<template>
  <page-container drawer ref="container" @loginuser="data => loginUser = data">
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>提醒</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="markAllAsRead">
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
          <v-list-tile-content>
            <v-list-tile-title>
              <v-avatar size="24">
                <img :src="item.author.avatar_url">
              </v-avatar>
              {{item.author.loginname}}
              <template v-if="item.type === 'reply'">回复了你的主题 <b>{{item.topic.title}}</b></template>
              <template v-else-if="item.type === 'at'">在主题 <b>{{item.topic.title}}</b> 中提到了你</template>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
    <div class="loading text-center">
      <v-progress-circular v-show="showGetNotiesLoading" indeterminate color="primary"></v-progress-circular>
      <div v-show="!showGetNotiesLoading && unread.length === 0 && read.length === 0" class="grey--text">
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
export default {
  data () {
    return {
      accessToken: null,
      read: [],
      unread: [],
      showGetNotiesLoading: false,
      loginUser: null
    }
  },
  computed: {
    allMessages () {
      return [...this.unread, ...this.read]
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
          this.unread = data.data.hasnot_read_messages
          this.read = data.data.has_read_messages
        }
      }).finally(() => {
        this.showGetNotiesLoading = false
      })
    },
    markAsRead (item, index) {
      this.ajax(`/message/mark_one/${item.id}`, {
        method: 'post',
        data: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        if (data.success) {
          item.has_read = true
          this.read.unshift(this.unread.splice(index, 1))
        }
      })
    },
    markAllAsRead () {
      if (this.unread.length === 0) return

      this.ajax('/message/mark_all', {
        method: 'post',
        data: {
          accesstoken: this.accessToken
        }
      }).then(data => {
        if (data.success) {
          Array.from(this.unread)
            .reverse()
            .forEach(item => {
              item.has_read = true
              this.read.unshift(item)
            })
          this.unread = []
        }
      })
    }
  }
}
</script>

