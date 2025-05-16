<template>
  <v-container class="facility-container fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="d-flex flex-column fill-height" cols="12">
        Area Home
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
  /** Imports */
  import { watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { loadAreaContext } from '@/router/loadAreaContext.js';

  /** Setup */
  const route = useRoute()

  /** Watchers */
  watch(
    () => route.params.area,
    async (newArea, oldArea) => {
      if (newArea !== oldArea) {
        try {
          await loadAreaContext(newArea)
        } catch (e) {
          console.error('Failed to reload area context:', e)
        }
      }
    },
    { immediate: true } // load once on initial mount too
  )
</script>

<style scoped>
.facility-container {
    padding: 16px;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
}
.editor-column{
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    height: 100%;
}

@media (max-width: 600px) {
    .facility-container {
        padding: 8px;
    }
    .editor-column {
        max-width: 90vw;
    }
}
</style>
