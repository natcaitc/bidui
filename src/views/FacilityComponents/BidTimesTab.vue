<template>
  <v-card flat>
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <h6 class="text-h6">Configure Bidding Start & End Times</h6>
          <v-card-text class="px-0">
            <em>
              Enter times in LOCAL time ({{ facilityTimezone }}). Times will remain the same regardless of
              Daylight Saving Time.
            </em>
          </v-card-text>

          <v-table class="mt-2">
            <thead>
              <tr>
                <th style="width: 50%">Days of Week</th>
                <th>Bid Start Time</th>
                <th>Bid End Time</th>
                <th v-if="facility.bid_days && facility.bid_days.length > 1" style="width: 25px" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(day, i) in bidHours" :key="i">
                <td>
                  <v-select
                    v-model="day.days"
                    chips
                    closable-chips
                    density="comfortable"
                    :item-title="id => days.find(x => x.id === id).name"
                    item-value="id"
                    :items="filteredDays.map(day => day.id)"
                    label="Select Days of Week"
                    multiple
                    variant="outlined"
                  />
                </td>
                <td>
                  <div class="d-flex align-center">
                    <v-time-picker
                      v-model="day.bid_start"
                      class="me-2"
                      format="24hr"
                      variant="outlined"
                    />
                    <span class="font-weight-bold">{{ facilityTimezone }}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <v-time-picker
                      v-model="day.bid_end"
                      class="me-2"
                      format="24hr"
                      variant="outlined"
                    />
                    <span class="font-weight-bold">{{ facilityTimezone }}</span>
                  </div>
                </td>
                <td v-if="facility.bid_days && facility.bid_days.length > 1">
                  <v-btn
                    color="error"
                    icon
                    variant="text"
                    @click="facility.bid_days.splice(i, 1)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-btn
            v-if="selectedDays.length < 7"
            class="mt-2"
            prepend-icon="mdi-plus"
            variant="text"
            @click="facility.bid_days.push({ days: [], bid_start: '', bid_end: '' })"
          >
            New Days
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="facility.timezone"
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

<script setup>
</script>
