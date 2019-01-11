<template>
  <page-container :show-bottom-nav="false">
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>关于</v-toolbar-title>
    </template>
    <v-card flat>
      <v-card-title>
        <h1>CNode-V 0.9.4</h1>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p>本项目主要基于Vuetify开发，同时要感谢cnodejs.org提供的API。Android平台建议使用Chrome浏览器打开，iOS平台建议使用Safari浏览器打开，点击“添加到主屏幕”即可安装独立的PWA应用。</p>
        <p>开发者：<a target="_blank" href="https://github.com/oodzchen">oodzchen</a></p>
        <p>源码：<a target="_blank" href="https://github.com/oodzchen/CNode-V">https://github.com/oodzchen/CNode-V</a></p>
      </v-card-text>
    </v-card>
  </page-container>
</template>