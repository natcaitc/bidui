<template>
  <FacilityTabBase :facility="facility" @save="handleSave">
    <template #default="{ facility: _facility, hasChanges, prepareChanges }">
      <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Configure Bidding Start & End Times</span>
          <v-btn
            color="primary"
            :disabled="!hasChanges"
            @click="prepareChanges"
          >
            Save Changes
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-table class="mt-2" density="compact">
                <thead>
                  <tr>
                    <th style="width: 50%">Days of Week</th>
                    <th>Closed</th>
                    <th>Bid Start Time</th>
                    <th>Bid End Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="day in _facility.bid_days" :key="day.weekday">
                    <td>{{ day.weekday }}</td>
                    <td>
                      <v-checkbox
                        v-model="day.closed"
                        :false-value="false"
                        :true-value="true"
                        @change="handleDayClosedChange(day)"
                      />
                    </td>
                    <td v-if="!day.closed">
                      <v-text-field
                        v-model="day.open"
                        class="mt-4 mb-0"
                        density="compact"
                        label="Select Time"
                        type="time"
                        variant="outlined"
                      />
                    </td>
                    <td v-if="!day.closed">
                      <v-text-field
                        v-model="day.close"
                        class="mt-4 mb-0"
                        density="compact"
                        label="Select Time"
                        type="time"
                        variant="outlined"
                      />
                    </td>
                    <td v-else colspan="2" />
                  </tr>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="_facility.timezone"
                density="comfortable"
                :items="timezones"
                label="Facility Timezone"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </FacilityTabBase>
</template>

<script setup>
  import FacilityTabBase from '@/views/FacilityComponents/FacilityTabBase.vue';

  const props = defineProps({
    facility: {
      type: Object,
      required: true,
    },
    saveHandler: {
      type: Function,
      default: null,
    },
  });

  const emit = defineEmits(['save']);

  // const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timezones = [
    'America/New_York', // Eastern
    'America/Chicago', // Central
    'America/Denver', // Mountain
    'America/Phoenix', // Mountain (no DST)
    'America/Los_Angeles', // Pacific
    'America/Anchorage', // Alaska
    'America/Adak', // Aleutian Islands
    'Pacific/Honolulu', // Hawaii
    'Pacific/Guam', // Guam
    'America/Puerto_Rico', // Puerto Rico
    'America/St_Thomas', // U.S. Virgin Islands
    'America/Boise', // Special Mountain Zone
    'America/Indiana/Indianapolis', // Eastern (no DST for some)
    'America/Detroit', // Eastern variant
  ];

  // Handle when a day is marked as closed
  function handleDayClosedChange (day) {
    console.log('Day closed changed:', day.weekday, 'Closed:', day.closed);

    if (day.closed) {
      // Clear the time fields when marked as closed
      day.open = '';
      day.close = '';
    }
  }

  function handleSave (_facility) {
    console.log('BidTimesTab handleSave called with:', _facility);
    if (props.saveHandler) {
      props.saveHandler(_facility);
    } else {
      emit('save', _facility);
    }
  }
</script>
