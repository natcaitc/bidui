<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <v-spacer />
      <div>
        <v-btn
          class="mr-2"
          color="success"
          :disabled="!canEditFacility"
          @click="openCreate(defaultAreaFields)"
        >
          <v-icon v-if="display.mdAndUp.value" icon="plus" start />
          <v-icon v-else icon="plus" />
          <span v-if="display.mdAndUp.value">Add Area</span>
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text>
      <v-data-table
        class="elevation-1"
        :headers="headers"
        :items="areas || []"
      >
        <template #item="{ item, index }">
          <tr>
            <td>{{ item.name }}</td>
            <td><span class="text-caption text-medium-emphasis">{{ item.slug }}</span></td>
            <td>
              <div class="d-flex justify-end">
                <v-btn
                  v-if="!canEditArea(item)"
                  color="primary"
                  density="compact"
                  icon
                  size="small"
                  variant="text"
                  @click="openEdit(item)"
                >
                  <v-icon size="small">fass fa-eye</v-icon>
                </v-btn>
                <v-btn
                  v-if="canEditArea(item)"
                  class="me-1"
                  color="primary"
                  density="compact"
                  icon
                  size="small"
                  variant="text"
                  @click="openEdit(item)"
                >
                  <v-icon size="small">edit</v-icon>
                </v-btn>
                <v-btn
                  v-if="(areas || []).length > 1"
                  class="me-2"
                  color="error"
                  density="compact"
                  :disabled="!canEditFacility"
                  icon
                  size="small"
                  variant="text"
                  @click="requestDelete(item)"
                >
                  <v-icon size="small">trash</v-icon>
                </v-btn>
                <v-btn
                  class="me-1"
                  density="compact"
                  :disabled="index === areas.length - 1"
                  icon
                  size="small"
                  variant="text"
                  @click="orderAreas(index, 1)"
                >
                  <v-icon size="small">chevron-down</v-icon>
                </v-btn>
                <v-btn
                  class="ma-0"
                  density="compact"
                  :disabled="index === 0"
                  icon
                  size="small"
                  variant="text"
                  @click="orderAreas(index, -1)"
                >
                  <v-icon size="small">chevron-up</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <!-- Create/Edit Dialog -->
  <FormDialog
    v-model="showDialog"
    :action-label="isEdit ? 'Update' : 'Create'"
    :form-data="formData"
    :loading="loading"
    :title="isEdit ? 'Edit Area' : 'New Area'"
    @submit="handleSave"
  >
    <template #default="{ data }">
      <AreaForm
        :area="data"
        :can-edit-area="canEditArea(_area)"
        :can-edit-facility="canEditFacility"
        :is-edit="false"
        @update:area="val => data = val"
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
        <strong class="text-danger">{{ itemToDelete?.name }}</strong> area?
      </p>
      <small class="text-red">This action cannot be undone.</small>
    </div>
  </ConfirmDialog>
</template>

<script setup>
/** Imports */
  import { computed, ref, watch } from 'vue';
  import AreaForm from '@/views/FacilityConfigure/AreaForm.vue';
  import { useDisplay } from 'vuetify';
  import { useRoute } from 'vue-router';
  import FormDialog from '@/components/FormDialog.vue';
  import ConfirmDialog from '@/components/ConfirmDialog.vue';
  import { useCrud } from '@/composables/useCrud.js';
  import { AreaRepository } from '@/api/index.js';
  import { useToastStore } from '@/stores/toasts.js';
  import { logError } from '@/utils/logError.js';
  import { useAreaStore } from '@/stores/area.js';
  import { storeToRefs } from 'pinia';

  /** Setup */
  defineEmits(['save', 'delete-area']);
  defineProps({
    canEditFacility: {
      type: Boolean,
      default: false,
    },
    canEditArea: {
      type: Function,
      default: () => false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  });
  const AREA = new AreaRepository();
  const toastStore = useToastStore();
  const route = useRoute();
  const defaultAreaFields = ref({});
  const displayObject = useDisplay();
  const display = {
    mdAndUp: computed(() => displayObject?.mdAndUp || false),
  };
  const areaStore = useAreaStore();
  const { areas } = storeToRefs(areaStore);
  const {
    loading,
    formData,
    openCreate,
    openEdit,
    showDialog,
    isEdit,
    save,
    requestDelete,
    showDeleteConfirm,
    confirmDelete,
    itemToDelete,
  } = useCrud(AREA)

  /** Data */
  const headers = [
    { title: 'Area Name', key: 'name' },
    { title: 'Slug', key: 'slug' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
  ];
  const _areas = ref([]);
  const _area = ref({}); // Working copy of area for the form

  /** Actions */
  const handleSave = async data => {
    console.log('AreasTab.handleSave', data);
    await save(r => {
      if (isEdit.value) {
        // Find and update the area in the store
        areaStore.updateArea(r)
      } else {
        areaStore.insertArea(r)
      }
    })
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
  const orderAreas = async (index, direction) => {
    const areas = _areas.value
    const targetIndex = index + direction
    console.log('AreasTab.moveArea', index, direction, areas, targetIndex);
    // Prevent invalid movement
    if (targetIndex < 0 || targetIndex >= areas.length) return

    // Swap items
    const temp = areas[index]
    areas[index] = areas[targetIndex]
    areas[targetIndex] = temp

    // Emit updated order data for the two changed areas
    const updated = [
      { id: areas[index].id, order: index },
      { id: areas[targetIndex].id, order: targetIndex },
    ]

    console.log('Area reordered:', updated)
    // Persist the changes
    try {
      /** @param {import('@/types/context').AreaContextData} context */
      await AREA.order({ data: updated })
    } catch (e) {
      await logError(e, { tag: 'area.moveArea', message: 'Failed to reorder areas.' })
    }
  }

  /** Lifecycle */
  onMounted(() => {
    console.log('AreasTab.onMounted');
    defaultAreaFields.value = {
      facility_id: route.params.facility,
      name: '',
      slug: '',
      tag: '',
      use_bid_aid: 0,
      subtract_holiday_leave: 0,
      grace_hours: '4',
      accrual_slot_factor: '8',
    };
    console.log('AreasTab.onMounted', defaultAreaFields.value);
  });

  /** Watchers */
  watch(() => areas, newAreas => {
    if (newAreas) {
      _areas.value = JSON.parse(JSON.stringify(newAreas))
    }
  }, { immediate: true, deep: true })
</script>
