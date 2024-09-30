<template>
  <v-navigation-drawer app permanent >
    <v-list>
      <v-list-item link to='/'>
        <v-list-item-content>
          <v-list-item-title>Navigation</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link to='/home'>
        <v-list-item-content>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link to='/workload'>
        <v-list-item-content>
          <v-list-item-title>Workload</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link to='/about'>
        <v-list-item-content>
          <v-list-item-title>About</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'Sidebar'
}
</script>
