<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title class="primary-title">Dashboard</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn text to='/'>Dashboard</v-btn>
      <v-btn text to='/home'>Home</v-btn>
      <v-btn text to='/workload'>Workload</v-btn>
      <v-btn text to='/about'>About</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>
