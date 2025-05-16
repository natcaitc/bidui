<template>
  <v-container v-if="round" fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <span class="text-h5">{{ round.name }}</span>
              <v-chip
                class="ml-2"
                :color="getStatusColor(round.status)"
                size="small"
              >
                {{ getStatusText(round.status) }}
              </v-chip>
            </div>

            <div>
              <round-status-button
                v-if="can('facility:round_AI:edit')"
                :round="round"
                @status-updated="onStatusUpdate"
              />

              <v-btn
                v-if="can('facility:round_AI:edit')"
                class="ml-2"
                color="primary"
                :to="`/${facilityId}/rounds/${roundId}/edit`"
                variant="outlined"
              >
                Edit
              </v-btn>

              <v-btn
                v-if="can('facility:round_AI:config')"
                class="ml-2"
                color="primary"
                :to="`/${facilityId}/rounds/${roundId}/config`"
                variant="outlined"
              >
                Bid Windows
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item>
                    <template #prepend>
                      <v-icon class="mr-2" icon="mdi-map-marker" />
                    </template>
                    <v-list-item-title>Area</v-list-item-title>
                    <v-list-item-subtitle>{{ round.area_name }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon class="mr-2" icon="mdi-calendar" />
                    </template>
                    <v-list-item-title>Date Range</v-list-item-title>
                    <v-list-item-subtitle>
                      <!--                      {{ formatDate(round_AI.start_date) }} - {{ formatDate(round_AI.end_date) }}-->
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon class="mr-2" icon="mdi-information" />
                    </template>
                    <v-list-item-title>Description</v-list-item-title>
                    <v-list-item-subtitle>{{ round.description || 'No description provided' }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">
                    Bidding Statistics
                  </v-card-title>

                  <v-card-text>
                    <v-row>
                      <v-col cols="6">
                        <div class="text-center">
                          <div class="text-h4">{{ bidders.length }}</div>
                          <div class="text-caption">Total Bidders</div>
                        </div>
                      </v-col>

                      <v-col cols="6">
                        <div class="text-center">
                          <div class="text-h4">{{ completedBids }}</div>
                          <div class="text-caption">Completed Bids</div>
                        </div>
                      </v-col>
                    </v-row>

                    <v-progress-linear
                      class="mt-4"
                      color="primary"
                      height="10"
                      :model-value="bidProgress"
                      rounded
                    >
                      <template #default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <v-card-title>
            Bid Roster
            <v-btn
              v-if="can('facility:round_AI:roster:view')"
              class="ml-2"
              color="primary"
              :to="`/${facilityId}/rounds/${roundId}/roster`"
              variant="text"
            >
              Full Roster
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              class="elevation-1"
              :headers="bidderHeaders"
              :items="topBidders"
              :items-per-page="5"
              :loading="loading"
            >
              <template #[`item.bid_status`]="{ item }">
                <v-chip
                  :color="getBidStatusColor(item.bid_status)"
                  size="small"
                >
                  {{ getBidStatusText(item.bid_status) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else-if="loading">
    <v-skeleton-loader type="card" />
  </v-container>

  <v-container v-else>
    <v-alert type="error">Round not found</v-alert>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useRoundStore } from '@/stores/round'
  import { useAuthStore } from '@/stores/auth'
  // import { format } from 'date-fns'
  import RoundStatusButton from '@/views/round_AI/RoundStatusButton.vue'

  const route = useRoute()
  const roundStore = useRoundStore()
  const authStore = useAuthStore()

  // Computed
  const roundId = computed(() => route.params.roundId)
  const facilityId = computed(() => route.params.facility)
  const round = computed(() => roundStore.currentRound)
  const loading = computed(() => roundStore.loading)
  const bidders = computed(() => roundStore.bidders)

  const topBidders = computed(() => {
    return [...bidders.value]
      .sort((a, b) => a.bid_order - b.bid_order)
      .slice(0, 5)
  })

  const completedBids = computed(() => {
    return bidders.value.filter(b => b.bid_status === 'complete').length
  })

  const bidProgress = computed(() => {
    if (bidders.value.length === 0) return 0
    return (completedBids.value / bidders.value.length) * 100
  })

  const bidderHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Bid Order', key: 'bid_order', sortable: true },
    { title: 'Status', key: 'bid_status', sortable: true },
    { title: 'Bid Time', key: 'bid_time', sortable: true },
  ]

  // Methods
  const can = permission => {
    return authStore.can(permission, { facilityId: facilityId.value })
  }

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

  const getBidStatusColor = status => {
    const statusColors = {
      pending: 'gray',
      active: 'primary',
      complete: 'success',
      missed: 'error',
    }
    return statusColors[status] || 'gray'
  }

  const getBidStatusText = status => {
    const statusText = {
      pending: 'Pending',
      active: 'Bidding Now',
      complete: 'Complete',
      missed: 'Missed',
    }
    return statusText[status] || status
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const onStatusUpdate = async () => {
    await roundStore.fetchRound(roundId.value)
  }

  // Lifecycle
  onMounted(async () => {
    if (roundId.value) {
      await Promise.all([
        roundStore.fetchRound(roundId.value),
        roundStore.fetchBidders(roundId.value),
      ])
    }
  })

  watch(roundId, async newId => {
    if (newId) {
      await Promise.all([
        roundStore.fetchRound(newId),
        roundStore.fetchBidders(newId),
      ])
    }
  })
</script>
