export default {
  CHANGE_THEME (state, color) {
    state.themeColor = color
  },
  CHANGE_SNACK (state, payload) {
    state.snack = Object.assign(state.snack, payload)
  },
  CHANGE_PAGELOADING (state, payload) {
    state.pageLoading = payload
  },
  UPDATE_MSGS (state, payload) {
    state.readMsgs = payload.read
    state.unreadMsgs = payload.unread
  },
  READ_SINGLE_MSG (state, msgId) {
    let msgIndex
    let msgObj

    state.unreadMsgs.forEach((msg, index) => {
      if (msg.id === msgId) {
        msgIndex = index
        msgObj = msg
      }
    })

    if (!msgIndex) return

    msgObj.has_read = true
    state.readMsgs.unshift(state.unreadMsgs.splice(msgIndex, 1))
  },
  READ_ALL_MSGS (state) {
    Array.from(state.unreadMsgs)
      .reverse()
      .forEach(item => {
        item.has_read = true
        state.readMsgs.unshift(item)
      })
    state.unreadMsgs = []
  }
}
