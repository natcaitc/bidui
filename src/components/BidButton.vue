<template>
  <v-btn
    v-if="bidder?.up_to_bid"
    color="success"
    density="compact"
    prepend-icon="book"
    variant="elevated"
  >Bid Now</v-btn>
  <v-btn
    v-else
    color="primary"
    density="compact"
    disabled
    prepend-icon="check"
    variant="elevated"
  >Entered</v-btn>
  <v-btn
    v-if="bidder?.bid"
    class="ml-2"
    density="compact"
    icon
    variant="text"
  >
    <v-icon color="error" size="small">delete-left</v-icon>
  </v-btn>
</template>

<script setup>
  const props = defineProps({
    round: {
      type: Object,
      required: true,
    },
    /** @type {import('@/types').Bidder} */
    bidder: {
      type: Object,
      required: true,
    },
  })
</script>
