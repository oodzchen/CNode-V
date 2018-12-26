<template>
  <page-container :show-bottom-nav="false">
    <v-toolbar app tabs dark class="top-toolbar" color="primary">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>关于</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-card flat>
        <v-card-title>
          <h1>CNode-PWA 0.9.2</h1>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <p>本项目用到的开源项目有Vue、Vuetify、Font Awesome Free等，同时要感谢cnodejs.org提供的API。</p>
          <p>开发者：<a href="https://github.com/oodzchen">oodzchen</a></p>
          <p>项目地址：<a href="https://github.com/oodzchen/CNode-PWA">https://github.com/oodzchen/CNode-PWA</a></p>
        </v-card-text>
      </v-card>
    </v-content>
  </page-container>
</template>