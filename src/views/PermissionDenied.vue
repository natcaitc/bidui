<template>
  <v-container class="" fluid>
    <v-row align="start" justify="center">
      <v-col class="text-center" cols="12" md="6" sm="8">
        <v-card class="pa-6 mt-8" elevation="3">
          <v-card-title class="text-h5 mb-2">🚫 Permission Denied</v-card-title>
          <v-card-text>
            <p class="mb-4">
              You tried to access a feature that requires the
              <strong>{{ required }}</strong> permission.
            </p>
            <p class="mb-4">
              Your current role: <strong class="text-uppercase">{{ role }}</strong>.
            </p>
            <p class="mb-4">Please contact your facility admin if you believe this is an error.</p>
            <v-btn color="primary" to="/">← Return to Dashboard</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { useRoute } from 'vue-router'

  const route = useRoute()
  const required = route.query.required || 'unknown'
  const role = route.query.role || 'unknown'
</script>

<style scoped>
</style>
