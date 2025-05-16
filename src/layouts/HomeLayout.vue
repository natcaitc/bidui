<template>
  <v-main>
    <v-app-bar
      color="#ECECF1"
      density="compact"
      title="NATCA Schedule & Leave Bidding (BID)"
    >
      <v-btn icon>
        <a href="https://my.natca.org"><font-awesome-icon icon="fa-kit fa-mynatca-icon" size="2x" /></a>
      </v-btn>
      <v-btn color="primary" variant="tonal">
        <a href="https://natca.org">natca.org</a>
      </v-btn>
      <template #append>
        <login-logout />
      </template>
    </v-app-bar>

    <router-view />
  </v-main>

  <Footer />
</template>

<script setup>
  import Footer from '@/layouts/Footer.vue'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import LoginLogout from '@/components/LoginLogout.vue';
</script>

<style scoped>
.v-toolbar a {
  text-decoration: none;
  color: inherit;
}
</style>
