<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <span>Bid Windows: {{ round ? round.name : 'Loading...' }}</span>
          <v-chip
            v-if="round"
            class="ml-2"
            :color="getStatusColor(round.status)"
            size="small"
          >
            {{ getStatusText(round.status) }}
          </v-chip>
        </div>

        <div>
          <v-btn
            color="primary"
            prepend-icon="mdi-arrow-left"
            :to="`/${facilityId}/rounds/${roundId}`"
            variant="text"
          >
            Back to Round
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text>
        <p class="text-subtitle-1 mb-4">
          Configure bidding windows for each bidder. You can set up automatic scheduling or configure windows manually.
        </p>

        <v-tabs v-model="activeTab">
          <v-tab value="auto">Automatic Scheduling</v-tab>
          <v-tab value="manual">Manual Configuration</v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="mt-4">
          <!-- Automatic Scheduling Tab -->
          <v-window-item value="auto">
            <v-form ref="autoForm" v-model="autoFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="autoConfig.startDate"
                    label="Start Date"
                    :rules="[v => !!v || 'Start date is required']"
                    type="date"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="autoConfig.startTime"
                    label="First Bid Time"
                    :rules="[v => !!v || 'Start time is required']"
                    type="time"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="autoConfig.bidDuration"
                    label="Bid Duration (minutes)"
                    min="5"
                    :rules="[v => !!v || 'Bid duration is required']"
                    type="number"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="autoConfig.bufferTime"
                    label="Buffer Between Bids (minutes)"
                    min="0"
                    :rules="[v => !!v || 'Buffer time is required']"
                    type="number"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-checkbox
                    v-model="autoConfig.skipWeekends"
                    hint="Bidding will not be scheduled on weekends"
                    label="Skip Weekends"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12">
                  <v-checkbox
                    v-model="autoConfig.dailyHours"
                    label="Restrict Daily Hours"
                  />
                </v-col>

                <template v-if="autoConfig.dailyHours">
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="autoConfig.dailyStartTime"
                      label="Daily Start Time"
                      :rules="[v => !!v || 'Daily start time is required']"
                      type="time"
                      variant="outlined"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="autoConfig.dailyEndTime"
                      label="Daily End Time"
                      :rules="[v => !!v || 'Daily end time is required']"
                      type="time"
                      variant="outlined"
                    />
                  </v-col>
                </template>
              </v-row>

              <v-divider class="my-4" />

              <v-row>
                <v-col class="d-flex justify-end" cols="12">
                  <v-btn
                    class="mr-2"
                    color="primary"
                    :disabled="!autoFormValid"
                    variant="outlined"
                    @click="previewSchedule"
                  >
                    Preview Schedule
                  </v-btn>

                  <v-btn
                    color="success"
                    :disabled="!autoFormValid || !schedulePreview.length"
                    :loading="saving"
                    @click="applyAutoSchedule"
                  >
                    Apply Schedule
                  </v-btn>
                </v-col>
              </v-row>

              <v-row v-if="schedulePreview.length">
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title>Schedule Preview</v-card-title>
                    <v-card-text>
                      <v-data-table
                        :headers="previewHeaders"
                        :items="schedulePreview"
                        :items-per-page="10"
                      >
                        <template #[`item.bid_time`]="{ item }">
                          {{ formatDateTime(item.bid_time) }}
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-window-item>

          <!-- Manual Configuration Tab -->
          <v-window-item value="manual">
            <v-data-table
              class="elevation-1"
              :headers="manualHeaders"
              item-key="id"
              :items="bidders"
              :items-per-page="15"
              :loading="loading"
            >
              <template #[`item.bid_time`]="{ item }">
                <v-text-field
                  v-model="bidderWindows[item.id]"
                  density="compact"
                  hide-details
                  type="datetime-local"
                  variant="outlined"
                />
              </template>
            </v-data-table>

            <div class="d-flex justify-end mt-4">
              <v-btn
                color="primary"
                :loading="saving"
                @click="saveManualWindows"
              >
                Save Windows
              </v-btn>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useRoundStore } from '@/stores/round'
  // import { addMinutes, format, isWeekend, parseISO, set } from 'date-fns'

  const route = useRoute()
  const roundStore = useRoundStore()

  // State
  const activeTab = ref('auto')
  const autoFormValid = ref(true)
  const saving = ref(false)
  const autoForm = ref(null)
  const schedulePreview = ref([])
  const bidderWindows = reactive({})

  const autoConfig = reactive({
    startDate: '',
    startTime: '09:00',
    bidDuration: 30,
    bufferTime: 5,
    skipWeekends: true,
    dailyHours: true,
    dailyStartTime: '08:00',
    dailyEndTime: '17:00',
  })

  // Computed
  const roundId = computed(() => route.params.roundId)
  const facilityId = computed(() => route.params.facility)
  const round = computed(() => roundStore.currentRound)
  const loading = computed(() => roundStore.loading)
  const bidders = computed(() => roundStore.bidders)
  const sortedBidders = computed(() => [...bidders.value].sort((a, b) => a.bid_order - b.bid_order))

  const previewHeaders = [
    { title: 'Bid Order', key: 'bid_order', sortable: true, width: '100px' },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Bid Time', key: 'bid_time', sortable: true },
  ]

  const manualHeaders = [
    { title: 'Bid Order', key: 'bid_order', sortable: true, width: '100px' },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Bid Time', key: 'bid_time', sortable: false },
  ]

  // Methods
  const getStatusColor = status => {
    const statusColors = {
      draft: 'gray',
      active: 'success',
      complete: 'info',
      cancelled: 'error',
    }
    return statusColors[status] || 'gray'
  }

  const getStatusText = status => {
    const statusText = {
      draft: 'Draft',
      active: 'Active',
      complete: 'Complete',
      cancelled: 'Cancelled',
    }
    return statusText[status] || status
  }

  const formatDateTime = dateTime => {
    if (!dateTime) return 'Not scheduled'
    // return format(new Date(dateTime), 'MMM dd, yyyy h:mm a')
  }

  const previewSchedule = () => {
    // if (!autoFormValid.value) {
    //   autoForm.value?.validate()
    //   return
    // }
    //
    // // Get sorted bidders
    // const bidders = sortedBidders.value
    // if (!bidders.length) {
    //   return
    // }
    //
    // // Create start datetime
    // const startDateTime = `${autoConfig.startDate}T${autoConfig.startTime}`
    // let currentDateTime = new Date(startDateTime)
    //
    // // Generate schedule
    // const preview = []
    //
    // for (const bidder of bidders) {
    //   // Skip to next day if we hit end time and daily hours are restricted
    //   if (autoConfig.dailyHours) {
    //     const currentTime = format(currentDateTime, 'HH:mm')
    //     const endTime = autoConfig.dailyEndTime
    //
    //     if (currentTime >= endTime) {
    //       // Skip to next day
    //       currentDateTime = new Date(currentDateTime)
    //       currentDateTime.setDate(currentDateTime.getDate() + 1)
    //       currentDateTime = set(currentDateTime, {
    //         hours: parseInt(autoConfig.dailyStartTime.split(':')[0]),
    //         minutes: parseInt(autoConfig.dailyStartTime.split(':')[1]),
    //         seconds: 0,
    //       })
    //     }
    //   }
    //
    //   // Skip weekends if configured
    //   if (autoConfig.skipWeekends && isWeekend(currentDateTime)) {
    //     // Skip to Monday
    //     const daysToAdd = currentDateTime.getDay() === 0 ? 1 : 2 // Sunday: add 1, Saturday: add 2
    //     currentDateTime = new Date(currentDateTime)
    //     currentDateTime.setDate(currentDateTime.getDate() + daysToAdd)
    //     currentDateTime = set(currentDateTime, {
    //       hours: parseInt(autoConfig.dailyStartTime.split(':')[0]),
    //       minutes: parseInt(autoConfig.dailyStartTime.split(':')[1]),
    //       seconds: 0,
    //     })
    //   }
    //
    //   // Add bidder to preview
    //   preview.push({
    //     id: bidder.id,
    //     name: bidder.name,
    //     bid_order: bidder.bid_order,
    //     bid_time: currentDateTime.toISOString(),
    //   })
    //
    //   // Add bid duration + buffer time for next bidder
    //   currentDateTime = addMinutes(currentDateTime, autoConfig.bidDuration + autoConfig.bufferTime)
    // }
    //
    // schedulePreview.value = preview
  }

  const applyAutoSchedule = async () => {
    if (!schedulePreview.value.length) {
      return
    }

    try {
      saving.value = true

      // Convert preview to windows format
      const windows = schedulePreview.value.map(item => ({
        bidder_id: item.id,
        start_time: item.bid_time,
        duration: autoConfig.bidDuration,
      }))

      await roundStore.saveBiddingWindows(roundId.value, { windows })

      // Update bidder windows for manual tab
      await loadBidderWindows()
    } catch (error) {
      console.error('Failed to schedule windows:', error)
    } finally {
      saving.value = false
    }
  }

  const loadBidderWindows = async () => {
    if (!roundId.value) return

    // Clear existing windows
    Object.keys(bidderWindows).forEach(key => delete bidderWindows[key])

    try {
      const windows = await roundStore.fetchBiddingWindows(roundId.value)

      // Map windows to bidders
      if (windows && windows.length) {
        windows.forEach(window => {
          if (window.start_time) {
            // Format for datetime-local input (YYYY-MM-DDTHH:MM)
            bidderWindows[window.bidder_id] = new Date(window.start_time)
              .toISOString()
              .slice(0, 16)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load bid windows:', error)
    }
  }

  const saveManualWindows = async () => {
    try {
      saving.value = true

      // Convert manual windows to API format
      const windows = Object.entries(bidderWindows)
        .filter(([_, value]) => value) // Filter out empty values
        .map(([bidderId, dateTime]) => ({
          bidder_id: bidderId,
          start_time: new Date(dateTime).toISOString(),
          duration: autoConfig.bidDuration, // Use the same duration as in auto config
        }))

      await roundStore.saveBiddingWindows(roundId.value, { windows })
    } catch (error) {
      console.error('Failed to save windows:', error)
    } finally {
      saving.value = false
    }
  }

  // Initialize date in auto config
  onMounted(() => {
    // Set default start date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    autoConfig.startDate = tomorrow.toISOString().split('T')[0]
  })

  // Add saveBiddingWindows method to round_AI store if not already exists
  if (!roundStore.saveBiddingWindows) {
    roundStore.saveBiddingWindows = async (roundId, windowsData) => {
      try {
        const response = await roundStore.roundRepository.saveBiddingWindows(roundId, windowsData)
        return response.data
      } catch (error) {
        console.error('Failed to save bidding windows:', error)
        throw error
      }
    }
  }

  // Lifecycle
  onMounted(async () => {
    if (roundId.value) {
      await Promise.all([
        roundStore.fetchRound(roundId.value),
        roundStore.fetchBidders(roundId.value),
      ])

      await loadBidderWindows()
    }
  })
</script>
