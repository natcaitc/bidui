<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <h3>Manage Rounds</h3>
            <v-btn
              v-if="can('round:admin')"
              color="primary"
              prepend-icon="plus"
              @click="openCreate(defaultRoundFields)"
            >
              Create Round
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-data-table
              density="compact"
              :headers="headers"
              hide-default-footer
              :items="rounds"
              :items-per-page="10"
              :loading="loading"
              :row-props="getRowClass"
              @click:row="handleRowClick"
            >
              <template #[`item.status`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  :text="getStatusText(item.status)"
                />
              </template>

              <template #[`item.roster`]="{ item }">
                <v-btn
                  color="primary"
                  density="compact"
                  icon
                  size="small"
                  title="View/Edit Roster"
                  :to="{name: 'rosters.home', params: { facility: facility.id, area: area.slug}, query: { roster: item.roster_id }}"
                  variant="text"
                >
                  <v-icon size="small">users</v-icon>
                </v-btn>
                {{ rosters.find(r => r.id === item.roster_id)?.name || '—' }}
              </template>

              <template #[`item.details`]="{ item }">
                <div v-if="item.type === 'line'">
                  Bid Windows: <strong>{{ item.use_bid_windows }}</strong>
                </div>
                <div v-else>
                  Allowed Days: <strong>{{ item.allowed_days }}</strong><br>
                  <strong>{{ item.use_bid_windows }}</strong>
                </div>
              </template>

              <template #[`item.actions`]="{ item }">
                <div class="d-flex justify-end">
                  <v-btn
                    density="compact"
                    icon
                    size="small"
                    title="View Round"
                    :to="`/${facility.id}/rounds/${item.id}`"
                    variant="text"
                  >
                    <v-icon size="small">eye</v-icon>
                  </v-btn>

                  <v-btn
                    density="compact"
                    icon
                    size="small"
                    title="Edit Round"
                    variant="text"
                    @click="openEdit(item)"
                  >
                    <v-icon size="small">cog</v-icon>
                  </v-btn>

                  <v-btn
                    color="error"
                    density="compact"
                    :disabled="!isRoundDeleteable(item)"
                    icon
                    size="small"
                    title="Delete Round"
                    variant="text"
                    @click="requestDelete(item)"
                  >
                    <v-icon size="small">trash</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <FormDialog
      v-model="showDialog"
      :action-label="isEdit ? 'Update' : 'Create'"
      :component="dialogComponent"
      :form-data="formData"
      :loading="loading"
      :title="isEdit ? 'Edit ' + formData.name : 'New Round'"
      @submit="handleSave"
    >
      <template #default="slotProps">
        <RoundForm
          :area="area"
          :bid-year="facility.bid_year"
          :is-edit="isEdit"
          :rosters="rosters"
          :round="slotProps.data"
          @delete="requestDelete"
          @reset="requestReset"
        />
        <!--


        <v-row v-if="canDeleteRound" density="compact">
          <v-col cols="12" sm="7">
            <v-subheader class="pl-0 font-weight-bold">Delete {{ _round.name }}</v-subheader>
            <div class="text-caption mb-2">
              Permanently removes this round and any recorded bids. Use caution!
            </div>
          </v-col>
          <v-col class="d-flex justify-end align-center" cols="12" sm="5">
            <v-btn
              color="error"
              rounded
              size="small"
              @click="emitDelete"
            >
              <v-icon class="mr-1" size="small">mdi-delete</v-icon>
              Delete {{ _round.name }}
            </v-btn>
          </v-col>
        </v-row>
        -->
      </template>
    </FormDialog>

    <!-- Delete Dialog -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Confirm Deletion"
      @confirm="handleConfirmDelete"
    >
      <div>
        <p>
          Are you sure you want to delete the
          <strong class="text-danger">{{ itemToDelete?.name }}</strong> area? All bids will be deleted and any scheduled
          bid windows will be removed.
        </p>
        <small class="text-red">This action cannot be undone.</small>
      </div>
    </ConfirmDialog>

    <!-- Reset Round Confirmation -->
    <v-dialog v-model="resetDialog" max-width="500">
      <v-card>
        <v-card-title>Reset {{ resetRound.name }}</v-card-title>
        <v-card-text>
          Are you sure you want to reset {{ resetRound.name }}? All bids will be deleted and the bid order unlocked.
          <small class="text-danger">This action cannot be undone.</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="gray" text @click="resetDialog = false">Cancel</v-btn>
          <v-btn color="warning" prepend-icon="rotate" variant="elevated" @click="handleReset">Reset {{ resetRound.name }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  /** Imports */
  import { computed, onMounted, ref, shallowRef } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useRoundStore } from '@/stores/round.js'
  import { useFacilityStore } from '@/stores/facility.js'
  import { useAreaStore } from '@/stores/area.js';
  import { useAuthStore } from '@/stores/auth.js'
  import RoundForm from '@/views/round/RoundForm.vue';
  import { getErrorMessage } from '@/utils/getErrorMessage.js';
  import { useToastStore } from '@/stores/toasts.ts';
  import FormDialog from '@/components/FormDialog.vue';
  import { RosterRepository, RoundRepository } from '@/api/index.js';
  import { useCrud } from '@/composables/useCrud.js';
  import ConfirmDialog from '@/components/ConfirmDialog.vue';
  import { logError } from '@/utils/logError.js';
  import BidWindowForm from '@/views/round/BidWindowForm.vue';

  /** Setup */
  const toast = useToastStore();
  const route = useRoute()
  const router = useRouter()
  const roundStore = useRoundStore()
  const facilityStore = useFacilityStore()
  const areaStore = useAreaStore();
  const authStore = useAuthStore()
  const RosterContextData = {
    areaSlug: areaStore.area.slug,
    bidYear: facilityStore.facility.bidYear,
  }
  const ROSTER = new RosterRepository()
  const ROUND = new RoundRepository()
  const { rounds } = storeToRefs(roundStore);
  /** @param {import('@/types/context.js').RoundContextData} RoundContextData */
  const RoundContextData = { areaSlug: route.params.area, bidYear: facilityStore.facility.bid_year }
  const {
    loading,
    formData,
    showDialog,
    isEdit,
    openCreate,
    openEdit,
    save,
    requestDelete,
    showDeleteConfirm,
    confirmDelete,
    itemToDelete,
  } = useCrud(ROUND, RoundContextData)
  // Dynamic dialog component for form
  const dialogComponent = shallowRef(RoundForm)
  const defaultRoundFields = {
    status: 'new',
    bid_limit: 5,
    bid_limit_unit: 'days',
    holidays_allowed: 99,
    crew_limit: 99,
    require_consecutive_days: false,
    teams_bid_concurrently: false,
    bidders_created: false,
  }

  /** State */
  const rosters = ref([])
  const deleteDialog = ref(false)
  const resetDialog = ref(false)
  const resetRound = ref(null)
  const roundToDelete = ref(null)
  const headers = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Roster', key: 'roster', sortable: true },
    { title: 'Details', key: 'details', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
  ]


  /** Computed */
  const facility = computed(() => facilityStore.facility)
  const area = computed(() => areaStore.area)

  /** Methods */
  const getRowClass = ({ item }) => { // Make Line Row stand out
    return item.type === 'line' ? { class: 'line-round' } : {}
  }
  function requestReset (round) {
    resetRound.value = round
    resetDialog.value = true
  }

  /**
   * Handle row click to navigate to round detail page.
   * @param event
   * @param {object} item - The clicked round item.
   */
  function handleRowClick (event, { item }) {
    console.log('click', item)
    if (event?.target?.closest('button, a, .v-btn, .v-icon')) return;

    if (item && item.id) {
      router.push({ name: 'rounds.view', params: { facility: facility.value.id, area: area.value.slug, roundId: item.id } });
    }
  }

  /** Actions */
  const handleSave = async () => {
    await save(r => {
      if (isEdit.value) {
        roundStore.updateRound(r)
      } else {
        rounds.value.push(r)
      }
    })
  }
  const handleReset = async () => {
    try {
      resetDialog.value = false
      const r = await ROUND.reset({ ...RoundContextData, id: resetRound.value.id })
      resetRound.value = null
      roundStore.updateRound(r.data)
    } catch (e) {
      await logError(e, { tag: 'RoundView.resetRound' })
    }
  }
  const handleConfirmDelete = () => {
    confirmDelete(deletedArea => {
      _areas.value = _areas.value.filter(a => a.id !== deletedArea.id)
      toastStore.showMessage({ message: 'Roster deleted successfully', color: 'success' })
    }, async e => {
      toastStore.showMessage({ message: 'Unable to delete the roster.', color: 'danger' })
      await logError(e, { tag: 'RosterView.deleteRoster' })
    })
  }


  const test = () => {
    const r = roundStore.updateRound(9510, 'holidays_allowed', 7)
    console.log(r)
  }
  async function updateRound (data) {
    try {
      if (!data || !data.id) {
        toast.showMessage({
          title: 'Error',
          message: 'Invalid round data',
          color: 'error',
        });
        return;
      }

      // Save to API via store
      await roundStore.updateRound(data);

      toast.showMessage({
        title: 'Success',
        message: 'Facility details saved successfully.',
        color: 'success',
      });
    } catch (e) {
      toast.showMessage({
        title: 'Server Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }
  function canAdminRound (item) {
    console.log('[canAdmin]', item, authStore.can('round:admin'))
    return authStore.can('round:admin')
  }
  function isRoundDeleteable (item) {
    return item.name !== 'Line Round' && item.id === roundStore.rounds[roundStore.rounds.length - 1]?.id
  }


  const can = permission => {
    return authStore.can(permission, { facilityId: facility.value?.id })
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

  const deleteRound = async () => {
    if (!roundToDelete.value) return

    try {
      await roundStore.deleteRound(roundToDelete.value.id)
      deleteDialog.value = false
      roundToDelete.value = null
    } catch (error) {
      console.error('Failed to delete round:', error)
    }
  }

  /** Lifecycle */
  onMounted(async () => {
    if (areaStore.area.id) {
      await roundStore.fetchRounds(facilityStore.facility.bid_year)
    }

    try {
      const r = await ROSTER.get(RosterContextData)
      rosters.value = r.data;
    } catch (e) {
      await logError(e, { tag: 'RoundForm.getRosters' })
    }
  })
</script>

<style>
.line-round {
  background-color: rgba(0, 128, 255, 0.1) !important;
  font-weight: 500;
}
.tooltip-wrap {
    white-space: normal;
    max-width: 250px;
    display: block;
}
</style>
