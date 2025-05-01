<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Facility Details</span>
      <v-btn
        color="primary"
        :disabled="!hasChanges"
        @click="saveChanges"
      >
        Save Changes
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="localFacility.name"
            density="comfortable"
            :disabled="!is('super')"
            label="Name"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="localFacility.id"
            density="comfortable"
            :disabled="!is('super')"
            label="Facility ID"
            maxlength="3"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="localFacility.bid_year"
            density="comfortable"
            :disabled="!is('super')"
            label="Bid Year"
            :maxlength="4"
            type="number"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-divider class="mt-3 mb-6" />
      <v-row>
        <v-col>
          <p class="mb-2">The bid year for <strong class="text-uppercase">{{ facility.id }}</strong> is set to <strong>{{ localFacility.bid_year }}</strong>.
            If you are ready to bid to configure the site for next year, click the button to the right.</p>
          <p class="font-italic font-weight-light">The system runs several processes in the background once this button is clicked. Wait a few minutes after clicking the button,
            then reload the page.</p>
        </v-col>
        <v-col class="d-flex align-center text-center">
          <manage-bid-year
            v-if="localFacility.id"
            :facility="facility"
            :is-super="is('super')"
          />
        </v-col>
      </v-row>
      <v-divider class="mb-2 mt-5" />
      <v-row>
        <v-col cols="12" md="4">
          <div class="d-flex align-center">
            <v-switch
              v-model="localFacility.test_mode"
              color="primary"
              :false-value="0"
              hide-details
              label="Test Mode"
              :true-value="1"
            />
            <v-tooltip location="top">
              <template #activator="{ props: aProps }">
                <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
              </template>
              <span>
                Mode for testing the site and different configurations. In test mode...
                <ul class="pa-0 ma-0">
                  <li>
                    Notifications will not be sent to controllers, notifications that would be sent
                    can be viewed in the Message screen
                  </li>
                </ul>
              </span>
            </v-tooltip>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex align-center">
            <v-switch
              v-model="localFacility.allow_text"
              color="primary"
              :false-value="0"
              hide-details
              label="Allow Text Messaging"
              :true-value="1"
            />
            <v-tooltip location="top">
              <template #activator="{ props: aProps }">
                <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
              </template>
              <span>
                Allows users for this facility to select text messaging as a notification option. Facility will
                be expected to cover costs associated with any text messages sent.
              </span>
            </v-tooltip>
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex align-center">
            <v-switch
              v-model="localFacility.privacy"
              color="primary"
              :false-value="0"
              hide-details
              label="Enable Privacy"
              :true-value="1"
            />
            <v-tooltip location="top">
              <template #activator="{ props: aProps }">
                <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
              </template>
              <span>
                Require users to be logged in to view lines and leave slots.
              </span>
            </v-tooltip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import ManageBidYear from '@/views/FacilityComponents/ManageBidYear.vue';

  const props = defineProps({
    facility: {
      type: Object,
      required: true,
    },
  })

  const emit = defineEmits(['save'])

  // Copy the facility from the store for editing
  const localFacility = ref(JSON.parse(JSON.stringify(props.facility)))
  const originalFacility = JSON.stringify(props.facility)

  // Track if there are unsaved changes
  const hasChanges = computed(() => {
    return JSON.stringify(localFacility.value) !== originalFacility
  })

  // Function to save changes
  function saveChanges () {
    emit('save', localFacility.value)
  }

  // import ManageBidYear from '../../components/ManageBidYear.vue'

  // Sample data structure - replace with actual data from your store or API
  // const facility = ref({
  //   id: '',
  //   name: '',
  //   timezone: '',
  //   bid_days: [{ days: [], bid_start: '', bid_end: '' }],
  //   auto_open_close: 0,
  //   test_mode: 0,
  //   test_slack: '',
  //   allow_text: 0,
  //   privacy: 0,
  // })

  // Days of week data
  const days = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
  ]

  // Timezones - replace with your actual list of timezones
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Honolulu',
  ]

  // Helper function to check user role
  const is = role => {
    // Replace with your actual role checking logic
    return true
  }

  // Selected days across all bid hour configurations
  const selectedDays = computed(() => {
    const allDays = []
    localFacility.value.bid_days.forEach(day => {
      allDays.push(...day.days)
    })
    return [...new Set(allDays)]
  })

  // Filtered days that are not yet selected
  const filteredDays = computed(() => {
    return days
  })

  // Alias for bid_days for better readability
  const bidHours = computed(() => localFacility.value.bid_days)

  // Facility timezone getter
  const facilityTimezone = computed(() => {
    return localFacility.value.timezone || 'No timezone selected'
  })
</script>
