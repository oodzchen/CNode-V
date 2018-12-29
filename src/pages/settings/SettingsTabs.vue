<template>
  <page-container>
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>首页板块</v-toolbar-title>
    </template>

    <v-list class="checkbox-list">
      <v-subheader>最多选择5项</v-subheader>
      <v-list-tile
        v-for="(item, index) in tabs"
        :key="index"
      >
        <v-checkbox
          :disabled="isDisabled(item.category)"
          v-model="selectedTabs"
          :value="item.category"
        >
          <v-list-tile-content slot="label">{{item.name}}</v-list-tile-content>
        </v-checkbox>
      </v-list-tile>
    </v-list>
  </page-container>
</template>

<style lang="stylus">
.checkbox-list
  .v-input--selection-controls .v-input__control,
  .v-input--selection-controls.v-input .v-label
    width: 100%
</style>

<script>
import tabs from '@/data/tabs'
import TABS_MAP from '@/data/tabs-map'

export default {
  data () {
    return {
      tabs: tabs,
      selectedTabs: []
    }
  },
  watch: {
    selectedTabs (newVal) {
      this.$localStorage.set('selectedTabs', this.selectedTabs)
    }
  },
  created () {
    let selectedTabs = this.$localStorage.get('selectedTabs')

    if (selectedTabs) {
      this.selectedTabs = selectedTabs.split(',')
    } else {
      this.selectedTabs = Object.keys(TABS_MAP).slice(0, 5)
      this.$localStorage.set('selectedTabs', this.selectedTabs.join(','))
    }
  },
  methods: {
    isDisabled (category) {
      return category === 'all' ||
        (this.selectedTabs.length === 5 && this.selectedTabs.indexOf(category) === -1)
    }
  }
}
</script>

