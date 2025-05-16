<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <span>Bid Roster: {{ round ? round.name : 'Loading...' }}</span>
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
        <v-data-table
          class="elevation-1"
          :headers="headers"
          item-key="id"
          :items="sortedBidders"
          :items-per-page="itemsPerPage"
          :loading="loading"
        >
          <template #[`item.bid_order`]="{ item }">
            {{ item.bid_order }}
          </template>

          <template #[`item.bid_status`]="{ item }">
            <v-chip
              :color="getBidStatusColor(item.bid_status)"
              size="small"
            >
              {{ getBidStatusText(item.bid_status) }}
            </v-chip>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-btn
              v-if="canEdit"
              color="primary"
              icon
              size="small"
              variant="text"
              @click="editBidder(item)"
            >
              <v-icon size="small">mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Edit Bidder Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600">
      <v-card>
        <v-card-title>
          Edit Bidder
        </v-card-title>

        <v-card-text>
          <v-form ref="bidderForm" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingBidder.name"
                  label="Name"
                  readonly
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editingBidder.bid_order"
                  label="Bid Order"
                  min="1"
                  :rules="[v => !!v || 'Bid order is required']"
                  type="number"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editingBidder.bid_status"
                  :items="statusOptions"
                  label="Bid Status"
                  variant="outlined"
                />
              </v-col>

              <v-col v-if="editingBidder.bid_status === 'scheduled'" cols="12">
                <v-text-field
                  v-model="editingBidder.bid_time"
                  label="Scheduled Bid Time"
                  type="datetime-local"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="gray" text @click="showEditDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="savingBidder"
            @click="saveBidder"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useRoundStore } from '@/stores/round'
  import { useAuthStore } from '@/stores/auth'

  const route = useRoute()
  const roundStore = useRoundStore()
  const authStore = useAuthStore()

  // State
  const showEditDialog = ref(false)
  const formValid = ref(true)
  const savingBidder = ref(false)
  const itemsPerPage = ref(15)
  const bidderForm = ref(null)
  const editingBidder = reactive({
    id: null,
    name: '',
    bid_order: 0,
    bid_status: '',
    bid_time: null,
  })

  // Computed
  const roundId = computed(() => route.params.roundId)
  const facilityId = computed(() => route.params.facility)
  const round = computed(() => roundStore.currentRound)
  const loading = computed(() => roundStore.loading)
  const bidders = computed(() => roundStore.bidders)
  const sortedBidders = computed(() => [...bidders.value].sort((a, b) => a.bid_order - b.bid_order))
  const canEdit = computed(() =>
    authStore.can('facility:round_AI:roster:edit', { facilityId: facilityId.value })
  )

  const headers = [
    { title: 'Bid Order', key: 'bid_order', sortable: true, width: '100px' },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Status', key: 'bid_status', sortable: true, width: '150px' },
    { title: 'Bid Time', key: 'bid_time', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end', width: '100px' },
  ]

  const statusOptions = [
    'pending',
    'scheduled',
    'active',
    'complete',
    'missed',
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

  const getBidStatusColor = status => {
    const statusColors = {
      pending: 'gray',
      scheduled: 'blue',
      active: 'primary',
      complete: 'success',
      missed: 'error',
    }
    return statusColors[status] || 'gray'
  }

  const getBidStatusText = status => {
    const statusText = {
      pending: 'Pending',
      scheduled: 'Scheduled',
      active: 'Bidding Now',
      complete: 'Complete',
      missed: 'Missed',
    }
    return statusText[status] || status
  }

  const editBidder = bidder => {
    // Clone bidder data to avoid modifying the original directly
    Object.assign(editingBidder, bidder)

    // Format date for the datetime-local input
    if (editingBidder.bid_time) {
      const date = new Date(editingBidder.bid_time)
      editingBidder.bid_time = date.toISOString().slice(0, 16) // Format as YYYY-MM-DDTHH:MM
    }

    showEditDialog.value = true
  }

  const saveBidder = async () => {
    if (!formValid.value) {
      bidderForm.value?.validate()
      return
    }

    try {
      savingBidder.value = true

      // Call API to update bidder
      await roundStore.updateBidder(roundId.value, editingBidder.id, editingBidder)

      // Refresh bidders list
      await roundStore.fetchBidders(roundId.value)

      showEditDialog.value = false
    } catch (error) {
      console.error('Failed to update bidder:', error)
    } finally {
      savingBidder.value = false
    }
  }

  // Add updateBidder method to round_AI store
  roundStore.updateBidder = async (roundId, bidderId, bidderData) => {
    if (!roundId || !bidderId) {
      return null
    }

    try {
      const roundRepository = new RoundRepository()
      const response = await roundRepository.updateBidder(roundId, bidderId, bidderData)
      return response.data
    } catch (err) {
      console.error('Failed to update bidder:', err)
      throw err
    }
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
</script>
