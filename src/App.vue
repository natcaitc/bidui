<template>
  <BootAuth0 />
  <v-app>
    <router-view />
    <Snackbar />
  </v-app>
</template>

<script setup>
  import Snackbar from '@/components/Snackbar.vue';
  import BootAuth0 from '@/components/BootAuth0.vue';
</script>
