<template>
  <v-card flat>
    <v-card-text>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="facility.test_slack"
          density="comfortable"
          disabled
          label="Facility Slack Webhook"
          variant="outlined"
        />
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script setup>
</script>
