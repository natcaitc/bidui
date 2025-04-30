<template>
  <v-snackbar
    v-model="store.snackbar"
    :color="store.color"
    location="top right"
    :timeout="store.timeout"
    @timeout="store.hideMessage"
  >
    <h3 v-if="store.title">{{ store.title }}</h3>
    {{ store.message }}
    <v-icon icon="fass fa-xmark" style="position: absolute; top: 5px; right: 5px;" @click="store.hideMessage" />
  </v-snackbar>
</template>

<script setup>
  import { useToastStore } from '@/stores/toasts';

  const store = useToastStore();
</script>
