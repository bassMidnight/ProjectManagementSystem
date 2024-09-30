<template>
  <v-app>
    <v-main>
      <Nav-bar></Nav-bar>
      <Side-bar></Side-bar>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar.vue'
import SideBar from './components/SideBar.vue'
export default {
  name: 'App',

  data: () => ({
    //
  }),
  components: {
    NavBar,
    SideBar
  }
}
</script>
