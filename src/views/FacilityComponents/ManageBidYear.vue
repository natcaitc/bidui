<template>
  <v-row>
    <v-col>
      <v-btn
        color="info"
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
  import { computed, onMounted, ref, watch } from 'vue'
  import { FacilityRepository } from '@/api'
  import { useFacilitiesStore } from '@/stores/facilities'

  const props = defineProps({
    facility: {
      type: Object,
      required: true,
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

  const new_year = ref(0)
  const dirty = ref(false)
  const dialogVisible = ref(false)
  const facilityRepo = new FacilityRepository()
  const facilitiesStore = useFacilitiesStore()

  // Computed properties
  const canChange = computed(() => {
    const currentYear = new Date().getFullYear()
    return props.isSuper || props.facility.bid_year === currentYear
  })

  const year = computed(() => {
    return dirty.value ? new_year.value : Number(new_year.value) + 1
  })

  // Methods
  function confirmNewYear () {
    dialogVisible.value = true
  }

  async function newYear () {
    try {
      const response = await facilityRepo.update(props.facility.id, { bid_year: year.value })

      // Update store and emit events for parent components
      facilitiesStore.updateFacility(response.data)
      emit('update:facility', response.data)
      emit('year', year.value)

      // Update local state
      new_year.value = response.data.bid_year
      dialogVisible.value = false
    } catch (error) {
      console.error('Failed to update bid year:', error)
    }
  }

  // Initialize component
  onMounted(() => {
    new_year.value = props.facility.bid_year
  })

  // Watch for changes to the input
  watch(new_year, newValue => {
    // If user changes the value, mark as dirty
    if (parseInt(newValue) !== props.facility.bid_year) {
      dirty.value = true
    }
  })
</script>
