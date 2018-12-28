export default function (timeStr) {
  let date = new Date(timeStr)
  let seconds = (Date.now() - date.getTime()) / 1000
  let text = ''

  if (seconds < 60) {
    text = '刚刚'
  } else if (seconds < 60 * 60) {
    text = Math.floor(seconds / 60) + '分钟前'
  } else if (seconds < 60 * 60 * 24) {
    text = Math.floor(seconds / (60 * 60)) + '小时前'
  } else if (seconds < 60 * 60 * 24 * 30) {
    text = Math.floor(seconds / (60 * 60 * 24)) + '天前'
  } else if (seconds < 60 * 60 * 24 * 30 * 12) {
    text = Math.floor(seconds / (60 * 60 * 24 * 30)) + '个月前'
  } else {
    text = Math.floor(seconds / (60 * 60 * 24 * 30 * 12)) + '年前'
  }

  return text
}
