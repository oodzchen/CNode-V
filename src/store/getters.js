export default {
  nightMode: state => state.themeColor === 'dark',
  unreadTopicsMap: state => {
    let obj = {}

    state.unreadMsgs.forEach(msg => {
      obj[msg.topic.id] = obj[msg.topic.id] ? [...obj[msg.topic.id], msg.id] : [msg.id]
    })
    return obj
  },
  unreadTopicIds: (state, getter) => {
    return Object.keys(getter.unreadTopicsMap)
  }
}
