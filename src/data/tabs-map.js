import TABS from './tabs'
let tabsMap = {}

TABS.forEach(item => {
  tabsMap[item.category] = item.name
})
export default tabsMap
