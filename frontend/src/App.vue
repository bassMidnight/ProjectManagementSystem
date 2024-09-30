<template>
  <v-app>
    <v-main>
      <Nav-bar></Nav-bar>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar.vue'
export default {
  name: 'App',

  data: () => ({
    //
  }),
  components: {
    NavBar
  }
}
</script>
