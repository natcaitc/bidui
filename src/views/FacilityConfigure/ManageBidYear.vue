<template>
  <v-row>
    <v-col>
      <v-btn
        color="info"
        :disabled="!can"
        prepend-icon="calendar"
        size="x-large"
        variant="elevated"
        @click="confirmNewYear"
      >
        Change Bid Year ({{ year }})
      </v-btn>
    </v-col>
  </v-row>

  <!-- Confirmation Dialog -->
  <v-dialog v-model="dialogVisible" max-width="500">
    <v-card>
      <v-card-title>Change Bid Year</v-card-title>
      <v-card-text>
        <h3 class="text-warning">Are you sure?</h3>
        The current data is archived for a minimum of one year. You can view data for previous years using the dropdown on the
        Line and Leave Slot pages.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey-darken-1" variant="text" @click="dialogVisible = false">
          Cancel
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="newYear">
          Change Bid Year
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  /* Imports */
  /** @typedef {import('@/types').Facility} Facility */
  import { computed, onMounted, ref, watch } from 'vue'
  import { FacilityRepository } from '@/api'
  import { useFacilityStore } from '@/stores/facility.js'

  /* Setup */
  const props = defineProps({
    /** @type {Facility} */
    facility: {
      type: Object,
      required: true,
    },
    can: {
      type: Boolean,
      default: false,
    },
    isSuper: {
      type: Boolean,
      default: false,
    },
    hideInput: {
      type: Boolean,
      default: false,
    },
  })
  const emit = defineEmits(['update:facility', 'year'])

  /* Data */
  const new_year = ref(0)
  const dirty = ref(false)
  const dialogVisible = ref(false)
  const facilityRepo = new FacilityRepository()
  const facilityStore = useFacilityStore()
  // Computed properties
  // const canChange = computed(() => {
  //   const currentYear = new Date().getFullYear()
  //   return props.isSuper || props.facility.bid_year === currentYear
  // })

  /* Computed */
  const year = computed(() => {
    return dirty.value ? new_year.value : Number(new_year.value) + 1
  })

  /* Methods */
  function confirmNewYear () {
    dialogVisible.value = true
  }
  async function newYear () {
    try {
      const response = await facilityRepo.update(props.facility.id, { bid_year: year.value })

      // Update store and emit events for parent components
      await facilityStore.updateFacility(response.data)
      emit('update:facility', response.data)
      emit('year', year.value)

      // Update local state
      new_year.value = response.data.bid_year
      dialogVisible.value = false
    } catch (error) {
      console.error('Failed to update bid year:', error)
    }
  }

  /* Lifecycle */
  onMounted(() => {
    new_year.value = props.facility.bid_year
  })

  /* Watchers */
  watch(new_year, newValue => {
    // If user changes the value, mark as dirty
    if (parseInt(newValue) !== props.facility.bid_year) {
      dirty.value = true
    }
  })
</script>
