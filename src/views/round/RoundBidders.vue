<template>
  <div class="round-bidders-container">
    <v-card variant="flat">
      <v-card-text class="pa-0">
        <v-data-table
          class="elevation-1"
          density="compact"
          :group-by="[{ key: 'team_name', order: 'asc' }]"
          :headers="getHeaders"
          hide-default-footer
          item-value="id"
          :items="flatBidders"
          :items-per-page="-1"
        >
          <template #group-header="{ item, columns, toggleGroup, isGroupOpen }">
            <tr :ref="el => registerGroupHeader(el, item, toggleGroup, isGroupOpen)" class="bg-primary">
              <td :colspan="columns.length">
                <div class="d-flex align-center">
                  <v-btn
                    density="compact"
                    :icon="isGroupOpen(item) ? '$expand' : '$next'"
                    size="small"
                    variant="text"
                    @click="toggleGroup(item)"
                  />

                  <span class="ms-4">{{ item.value }}</span>
                </div>
              </td>
            </tr>
          </template>

          <!-- Suppress default group control column -->
          <template #group="{ }" />

          <template #item.init="{ item }">
            <span style="text-transform: uppercase">{{ item.init }}</span>
          </template>

          <template #item.bid_status="{ item }">
            <bid-button :bidder="item" :round="round" />
          </template>

          <template #item.employee_type_id="{ item }">
            <v-chip v-if="employeeTypeName(item.employee_type_id) === 'Full-Time'" color="success" variant="outlined">
              {{ employeeTypeName(item.employee_type_id) }}
            </v-chip>
            <v-chip
              v-else-if="employeeTypeName(item.employee_type_id) === 'Developmental'"
              color="info"
              variant="outlined"
            >{{ employeeTypeName(item.employee_type_id) }}
            </v-chip>
            <v-chip v-else variant="outlined">{{ employeeTypeName(item.employee_type_id) }}</v-chip>
          </template>

          <template #item.start="{ item }">
            <v-btn :append-icon="later(item) ? 'clock' : ''" :color="item.bid ? 'success' : ''" :ripple="false" variant="text">{{ formatTime(item.start) }}
            </v-btn>
          </template>

          <template #item.leave_balance="{ item }">
            <div class="text-left">
              <h4 class="d-inline-block mr-2 w-25">{{ item.balance_accrued + item.balance_accumulated }}</h4>
              <small class="text-caption">( {{ item.balance_accrued }} | {{ item.balance_accumulated }} )</small>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
/** Imports */
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useFacilityStore } from '@/stores/facility.js'
  import { RoundRepository } from '@/api/index.js'
  import { logError } from '@/utils/logError.js'
  import BidButton from '@/components/BidButton.vue'
  import { format } from 'date-fns'

  /** Setup */
  const props = defineProps({
    /** @type {import('@/types').Round} */
    round: {
      type: Object,
      required: true,
    },
  })
  const route = useRoute()
  const facilityStore = useFacilityStore()
  const ROUND = new RoundRepository()
  const currentTime = ref(new Date())

  /** State */
  const loading = ref(true)
  const teams = ref([])
  /** @type {Ref<Record<string, { item: any, toggleGroup: Function, isGroupOpen: Function }>>} */
  const groupHeaders = ref([])

  /** Methods */
  // Find the employee type by name
  function employeeTypeName (id) {
    return facilityStore.employeeTypes.find(et => et.id === id)?.type_name || 'Unknown'
  }
  function formatTime (date) {
    return format(date, 'M/d/yy HHmm')
  }

  const loadRoundBidders = async () => {
    console.log('Loading round bidders...')
    try {
      loading.value = true
      /** @param {import('@/types/context').RoundContextData} RoundContext */
      const RoundContext = {
        areaSlug: route.params.area,
        id: props.round.id,
        bidYear: facilityStore.facility.bid_year,
      }
      const r = await ROUND.teamsBidders(RoundContext)
      teams.value = r.data
    } catch (e) {
      await logError(e, { tag: 'roundBidders.loadRoundBidders' })
    } finally {
      loading.value = false
    }
  }
  function registerGroupHeader (el, item, toggleGroup, isGroupOpen) {
    if (el && item?.value) {
      groupHeaders.value[item.value] = { item, toggleGroup, isGroupOpen }
    }
  }

  /** Computed */
  const getHeaders = computed(() => {
    return [
      { title: 'Initials', key: 'init', sortable: false, align: 'center', style: 'width: 60px' },
      { title: 'Name', key: 'name_lf', sortable: true, cellProps: () => ({ class: 'name-col' }) },
      { title: 'Bid Status', key: 'bid_status', sortable: false, align: 'left' },
      { title: 'Type', key: 'employee_type_id', sortable: true },
      { title: 'Bid Time', key: 'start' },
      { title: 'Leave ( acc | acu )', key: 'leave_balance', align: 'left' },
    ]
  })
  function later (item) {
    return new Date(item.start) < currentTime.value
  }

  // Flatten bidders into a single array with team_name only
  const flatBidders = computed(() => {
    return teams.value.flatMap(team =>
      team.bidders.map(bidder => ({
        ...bidder,
        team_name: team.name,
      }))
    )
  })

  /** Lifecycle */
  onMounted(async () => {
    await loadRoundBidders()

    // Expand all groups
    Object.values(groupHeaders.value).forEach(header => {
      header.toggleGroup(header.item)
    })

    // Countdown
    setInterval(() => {
      currentTime.value = new Date()
    }, 60000)
  })
</script>

<style scoped>
.round-bidders-container {
  height: 100%;
  padding: 0px;
}
:deep(.v-card) {
  height: auto !important;
  overflow: visible !important;
}

.team-container {
  margin-bottom: 16px;
}

.text-center-input :deep(input) {
  text-align: center;
  text-transform: uppercase;
}

:deep(.name-col) {
    width: 300px;
    text-wrap: nowrap;
}
</style>
