<template>
  <page-container>
    <template slot="toolbar">
      <v-btn icon @click="$router.go(-1)">
        <v-icon>fa-arrow-left</v-icon>
      </v-btn>
    </template>
    <v-card flat>
      <v-card-title>
        <h1>404 Not Found</h1>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p>Oops！该页面不存在，看来您输入的地址有问题。</p>
      </v-card-text>
    </v-card>
  </page-container>
</template>
