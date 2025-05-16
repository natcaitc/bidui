<template>
  <v-container fluid>
    <v-card flat>
      <v-card-title class="d-flex justify-space-between align-center px-2 mb-2">
        <h5 class="text-h5">Rosters</h5>
        <div>
          <v-menu
            v-model="showRosterOptionsMenu"
            :close-on-content-click="false"
          >
            <template #activator="{props}">
              <v-btn
                v-bind="props"
                class="mr-2"
                icon
                size="small"
                variant="text"
                @click="showRosterOptionsMenu = true"
              >
                <v-icon icon="gear" />
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                @click="editRosterForm"
              >
                <template #prepend>
                  <v-icon icon="pen-to-square" size="x-small" />
                </template>
                Edit Roster
              </v-list-item>
              <v-list-item
                v-if="!selectedRoster?.default"
                @click="confirmDeleteRoster"
              >
                <template #prepend>
                  <v-icon icon="trash" size="x-small" />
                </template>
                Delete Roster
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn
            color="primary"
            prepend-icon="plus"
            size="small"
            @click="createRosterForm"
          >
            New Roster
          </v-btn>
        </div>
      </v-card-title>

      <v-tabs
        v-model="selectedRosterTab"
        bg-color="light-blue-lighten-4"
        color="primary"
        grow
        show-arrows
        slider-color="primary"
      >
        <v-tab
          v-for="roster in rosters"
          :key="roster.id"
          :value="roster.id"
        >
          {{ roster.name }}
          <v-icon
            v-if="roster.default"
            class="ml-1"
            color="light-blue-lighten-2"
            size="small"
          >
            star
          </v-icon>
        </v-tab>
      </v-tabs>

      <v-window v-model="selectedRosterTab">
        <v-window-item
          v-for="roster in rosters"
          :key="roster.id"
          :value="roster.id"
        >
          <v-card flat>
            <v-card-text>
              <roster :roster="roster" />
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Create/Edit Dialog -->
    <FormDialog
      v-model="showDialog"
      :action-label="isEdit ? 'Update' : 'Create'"
      :form-data="formData"
      :loading="loading"
      :title="isEdit ? 'Edit Roster' : 'New Roster'"
      @submit="handleSave"
    >
      <template #default="props">
        <v-text-field
          v-model="props.data.name"
          label="Roster Name"
          :rules="[v => !!v || 'Name is required']"
          variant="outlined"
        />
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
          <strong class="text-danger">{{ selectedRoster?.name }}</strong> roster?
        </p>
        <small class="text-red">This action cannot be undone.</small>
      </div>
    </ConfirmDialog>

  </v-container>
</template>

<script setup>
  /** Imports */
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useToastStore } from '@/stores/toasts.js';
  import RosterRepository from '@/api/repos/RosterRepository.js'
  import Roster from './Roster.vue'
  import { logError } from '@/utils/logError.js';
  import { useCrud } from '@/composables/useCrud'
  import FormDialog from '@/components/FormDialog.vue'
  import ConfirmDialog from '@/components/ConfirmDialog.vue'

  /** Setup */
  const route = useRoute()
  const toastStore = useToastStore()
  const ROSTER = new RosterRepository()
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
  } = useCrud(ROSTER, { areaSlug: route.params.area })

  /** State */
  const rosters = ref([])
  const defaultRosterFields = ref({
    name: '',
    default: false,
  })
  const selectedRosterTab = ref(null)
  const showRosterOptionsMenu = ref(false)

  /** Computed */
  const selectedRoster = computed(() => rosters.value.find(r => r.id === selectedRosterTab.value))

  /** Methods */
  function createRosterForm () {
    openCreate(defaultRosterFields.value)
  }
  function editRosterForm () {
    if (!selectedRoster.value) return
    openEdit({ ...defaultRosterFields.value, ...selectedRoster.value })
    showRosterOptionsMenu.value = false
  }

  /** Actions */
  const loadRosters = async () => {
    try {
      loading.value = true
      const r = await ROSTER.get({ areaSlug: route.params.area })
      rosters.value = r.data

      // Set the selected roster
      if (rosters.value.length) {
        const defaultRoster = rosters.value.find(r => r['default'] === true)
        selectedRosterTab.value = defaultRoster ? defaultRoster.id : rosters.value[0].id
      }
    } catch (error) {
      console.error('Failed to load rosters:', error)
    } finally {
      loading.value = false
    }
  }
  const handleSave = async () => {
    await save(response => {
      if (isEdit.value) {
        // Find and update the roster in the array
        const index = rosters.value.findIndex(r => r.id === response.id)
        if (index !== -1) {
          rosters.value[index] = { ...rosters.value[index], ...response }
        }
      } else {
        rosters.value.push(response)
        console.log(response)
        selectedRosterTab.value = response.id
      }
    })
  }
  const handleConfirmDelete = () => {
    confirmDelete(deletedRoster => {
      rosters.value = rosters.value.filter(r => r.id !== deletedRoster.id)
      selectedRosterTab.value = rosters.value[0]?.id || null
      toastStore.showMessage({ message: 'Roster deleted successfully', color: 'success' })
    }, async e => {
      toastStore.showMessage({ message: 'Unable to delete the roster.', color: 'danger' })
      await logError(e, { tag: 'RosterView.deleteRoster' })
    })
  }
  const confirmDeleteRoster = () => {
    showRosterOptionsMenu.value = false
    requestDelete(selectedRoster.value)
  }

  /** Lifecycle */
  onMounted(async () => {
    await loadRosters()

    // Show the roster tab if specified
    if (route.query.roster) {
      const checkRoster = rosters.value.find(r => r.id === Number(route.query.roster))
      if (checkRoster) { selectedRosterTab.value = checkRoster.id }
    }
  })

  /** Watchers */
  watch(() => route.params.area, async newAreaId => {
    if (newAreaId) {
      await loadRosters()
    }
  })
</script>

<style scoped>
.v-list-item-title {
    font-size: 0.8rem;
}

.v-list-item {
    min-height: 30px;
}
</style>
