<template>
  <v-card flat>
    <v-card-title class="d-flex justify-space-between align-center">
      <v-spacer />
      <div>
        <v-btn
          class="mr-2"
          color="success"
          @click="createAreaForm"
        >
          <v-icon v-if="display?.mdAndUp?.value" icon="plus" start />
          <v-icon v-else icon="plus" />
          <span v-if="display?.mdAndUp?.value">Add Area</span>
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text>
      <v-data-table
        class="elevation-1"
        :headers="headers"
        :items="_areas || []"
      >
        <template #item="{ item, index }">
          <tr>
            <td>{{ item.name }}</td>
            <td><span class="text-caption text-medium-emphasis">{{ item.slug }}</span></td>
            <td>
              <div class="d-flex justify-end">
                <v-btn
                  color="primary"
                  icon
                  size="small"
                  variant="text"
                  @click="editAreaForm(item, index)"
                >
                  <v-icon size="small">edit</v-icon>
                </v-btn>
                <v-btn
                  v-if="(areas || []).length > 1"
                  color="error"
                  icon
                  size="small"
                  variant="text"
                  @click="confirmDeleteArea(item)"
                >
                  <v-icon size="small">trash</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="500">
    <v-card>
      <v-card-title>Delete Area</v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete the area <strong>{{ _area.name }}</strong>?</p>
        <p class="text-error font-weight-bold mt-4">This action cannot be undone!</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="resetForm">Cancel</v-btn>
        <v-btn color="error" variant="elevated" @click="deleteAreaConfirmed">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Form Dialog -->
  <v-dialog v-model="showFormDialog" max-width="800">
    <v-card>
      <v-card-title>Area Details</v-card-title>
      <v-card-text>
        <AreaForm v-model="_area" :is-edit="false" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="showFormDialog = false">Cancel</v-btn>
        <v-btn color="success" prepend-icon="floppy-disk" variant="elevated" @click="handleSave">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import AreaForm from '@/views/FacilityComponents/AreaForm.vue';
  import { useDisplay } from 'vuetify';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const defaultAreaFields = ref({});
  const displayObject = useDisplay();
  const display = ref({
    mdAndUp: computed(() => displayObject?.mdAndUp || false),
  });
  const props = defineProps({
    areas: {
      type: Array,
      default: () => [],
    },
    createArea: {
      type: Function,
      default: null,
    },
    updateArea: {
      type: Function,
      default: null,
    },
    deleteArea: {
      type: Function,
      default: null,
    },
  });
  const emit = defineEmits(['save', 'delete-area']);
  const headers = [
    { title: 'Area Name', key: 'name' },
    { title: 'Slug', key: 'slug' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
  ];

  /** Setup */
  onMounted(() => {
    console.log('AreasTab onMounted called with:', route.params);
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
  });

  /** Add/Edit Area */
  const showFormDialog = ref(null); // Display of the dialog with the form
  const formAction = ref('add'); // Add or Edit an area - add | edit
  const _areas = ref([]);
  const _area = ref({}); // Working copy of area for the form
  const _areaIdx = ref(-1);
  function handleSave () {
    console.log('AreasTab handleSave called with:');
    if (formAction.value === 'add') {
      if (props.createArea) {
        props.createArea(_area.value);
      } else {
        emit('save', _area.value);
      }
    } else if (formAction.value === 'edit') {
      if (props.updateArea) {
        props.updateArea(_area.value);
      } else {
        emit('save', _area.value);
      }
    }
    resetForm();
  }
  function createAreaForm () {
    _area.value = { ...defaultAreaFields.value };
    showFormDialog.value = true;
    formAction.value = 'add';
  }
  function editAreaForm (area, index) {
    // Make a local copy and ensure all fields have values
    _area.value = {
      ...defaultAreaFields.value,
      ...JSON.parse(JSON.stringify(area)),
    };

    // Ensure numeric fields are properly formatted
    _area.value.use_bid_aid = parseInt(_area.value.use_bid_aid || 0);
    _area.value.subtract_holiday_leave = parseInt(_area.value.subtract_holiday_leave || 0);

    _areaIdx.value = index;
    showFormDialog.value = true;
    formAction.value = 'edit';
  }
  function resetForm () { // Reset the form
    _area.value = { ...defaultAreaFields.value };
    showFormDialog.value = false;
    showDeleteDialog.value = false;
    formAction.value = 'add';
  }

  /** Delete Area */
  const showDeleteDialog = ref(false);
  function confirmDeleteArea (area) {
    _area.value = area;
    showDeleteDialog.value = true;
  }
  function deleteAreaConfirmed () {
    console.log('AreasTab deleteAreaConfirmed called with:', _area.value);
    if (props.deleteArea) {
      props.deleteArea(_area.value);
    } else {
      emit('delete-area', _area.value);
    }

    // Close dialog and clear state
    resetForm();
  }

  watch(() => props.areas, newAreas => {
    if (newAreas) {
      _areas.value = JSON.parse(JSON.stringify(newAreas))
    }
  }, { immediate: true, deep: true })
</script>
