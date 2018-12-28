<template>
  <page-container>
    <template slot="toolbar">
      <v-text-field 
        prepend-inner-icon="search" 
        label="搜索" 
        single-line
        v-model="keywords"
        @keyup.enter="onSubmit"></v-text-field>
    </template>
  </page-container>
</template>

<script>
export default {
  data () {
    return {
      keywords: ''
    }
  },
  methods: {
    onSubmit () {
      console.log(this.keywords)
    }
  }
}
</script>

