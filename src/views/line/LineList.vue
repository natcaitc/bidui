<template>
  <!-- Form Dialog for Create/Edit Line -->
  <FormDialog
    v-model="showDialog"
    :form-data="formData"
    :loading="loading"
    :title="isEdit ? 'Edit Line' : 'Create Line'"
    @submit="handleSubmit"
  >
    <template #default="{ data }">
      <LineForm
        :create="!isEdit"
        :crews="crews"
        :employee-types="facilityStore.employeeTypes"
        hide-actions
        :line="data"
        :line-group="lineGroup"
      />
    </template>
  </FormDialog>

  <!-- Confirm Dialog for Delete Line -->
  <ConfirmDialog
    v-model="showDeleteConfirm"
    title="Delete Line"
    @confirm="handleConfirmDelete"
  >
    Are you sure you want to delete the following line?
    <h4>{{ itemToDelete?.name }}</h4>
  </ConfirmDialog>

  <v-sheet class="elevation-4 custom-table ma-4">
    <!-- Table Header -->
    <div class="custom-table-header d-flex">
      <div class="name-header px-2 py-1">Line</div>
      <div class="init-header px-2 py-1 text-center">Init</div>
      <div class="details-header flex-grow-1 px-2 py-1">
        <div class="day-grid text-caption text-no-wrap w-100">
          <div class="day-col">
            <div class="day-header text-center">SU</div>
          </div>
          <div class="day-col">
            <div class="day-header text-center">MO</div>
          </div>
          <div class="day-col">
            <div class="day-header text-center">TU</div>
          </div>
          <div class="day-col">
            <div class="day-header text-center">WE</div>
          </div>
          <div class="day-col">
            <div class="day-header text-center">TH</div>
          </div>
          <div class="day-col">
            <div class="day-header text-center">FR</div>
          </div>
          <div class="day-col">
            <div class="day-header text-center">SA</div>
          </div>
        </div>
      </div>
      <div class="actions-header px-2 py-1">
        <v-btn
          color="primary"
          prepend-icon="plus"
          size="small"
          @click="handleCreateLine"
        >
          Add Line
        </v-btn>
      </div>
    </div>

    <!-- Table Content -->
    <div class="custom-table-content">
      <template v-for="(crew, crewIndex) in crews" :key="crewIndex">
        <!-- Group Header -->
        <div class="group-header bg-primary text-white px-2 py-1 d-flex align-center">
          <v-btn
            class="text-white mr-2"
            density="compact"
            :icon="expandedCrews.includes(crew.id) ? '$expand' : '$next'"
            size="small"
            variant="text"
            @click="toggleCrew(crew.id)"
          />
          <h6 class="mb-0">{{ crew.name }}</h6>
        </div>

        <!-- Group Items -->
        <div v-if="expandedCrews.includes(crew.id)" class="group-items">
          <!-- Draggable Lines -->
          <draggable
            v-model="_linesByCrew[crew.id]"
            class="line-list"
            ghost-class="ghost"
            group="lines"
            handle=".line-handle"
            item-key="id"
            @change="event => onLineDropped(event, crew)"
          >
            <template #item="{ element: line }">
              <div
                class="custom-table-row d-flex"
                :style="'border-bottom-color: ' + (line.bgcolor ? line.bgcolor : 'gray')"
              >
                <div class="line-handle d-flex align-center justify-center mr-1">
                  <v-icon size="x-small">grip-vertical</v-icon>
                </div>
                <div
                  class="name-cell d-flex align-center pl-3 font-weight-bold bg-surface"
                  :style="line.bgcolor ? `color: ${line.bgcolor}` : ''"
                >
                  {{ line.name }}
                </div>
                <div class="init-cell d-flex align-center justify-center bg-surface">
                  <v-chip
                    v-if="line.bid_id"
                    class="text-uppercase font-weight-medium mx-0 my-1 w-100"
                    :color="getEmployeeTypeProps(line.employee_type_id).color"
                    size="small"
                    text-color="white"
                    variant="elevated"
                  >
                    <v-icon
                      class="mr-1"
                      :icon="getEmployeeTypeProps(line.employee_type_id).icon"
                      size="x-small"
                      start
                    />
                    {{ line.bid_init }}
                  </v-chip>
                </div>
                <div class="details-cell flex-grow-1">
                  <div class="day-grid text-caption text-no-wrap w-100">
                    <div class="day-col" :class="line.details[0]?.su ? '' : 'rdo'">
                      <div class="text-center">{{ line.details[0]?.su }}</div>
                    </div>
                    <div class="day-col" :class="line.details[0]?.mo ? '' : 'rdo'">
                      <div class="text-center">{{ line.details[0]?.mo }}</div>
                    </div>
                    <div class="day-col" :class="line.details[0]?.tu ? '' : 'rdo'">
                      <div class="text-center">{{ line.details[0]?.tu }}</div>
                    </div>
                    <div class="day-col" :class="line.details[0]?.we ? '' : 'rdo'">
                      <div class="text-center">{{ line.details[0]?.we }}</div>
                    </div>
                    <div class="day-col" :class="line.details[0]?.th ? '' : 'rdo'">
                      <div class="text-center">{{ line.details[0]?.th }}</div>
                    </div>
                    <div class="day-col" :class="line.details[0]?.fr ? '' : 'rdo'">
                      <div class="text-center">{{ line.details[0]?.fr }}</div>
                    </div>
                    <div class="day-col" :class="line.details[0]?.sa ? '' : 'rdo'">
                      <div class="text-center">{{ line.details[0]?.sa }}</div>
                    </div>
                  </div>
                </div>
                <div class="actions-cell d-flex align-center justify-center bg-surface">
                  <v-tooltip text="View Line">
                    <template #activator="{ props: lProps }">
                      <v-btn
                        v-bind="lProps"
                        class="mr-2"
                        color="primary"
                        density="compact"
                        icon="eye"
                        size="x-small"
                        variant="text"
                        @click="viewLine(line)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Edit Line">
                    <template #activator="{ props: lProps }">
                      <v-btn
                        v-bind="lProps"
                        class="mr-2"
                        color="primary"
                        density="compact"
                        icon="pen-to-square"
                        size="x-small"
                        variant="text"
                        @click="openEdit(line)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Duplicate Line">
                    <template #activator="{ props: lProps }">
                      <v-btn
                        v-bind="lProps"
                        class="mr-2"
                        color="primary"
                        density="compact"
                        icon="copy"
                        size="x-small"
                        variant="text"
                        @click="duplicateLine(line)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Delete Line">
                    <template #activator="{ props: lProps }">
                      <v-btn
                        v-bind="lProps"
                        color="error"
                        density="compact"
                        icon="trash"
                        size="x-small"
                        variant="text"
                        @click="requestDelete(line)"
                      />
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </template>
    </div>
  </v-sheet>
</template>

<script setup>
  /** Imports */
  import { onMounted, ref } from 'vue';
  import { useFacilityStore } from '@/stores/facility.js';
  import { LineRepository } from '@/api';
  import { useCrud } from '@/composables/useCrud.js';
  import FormDialog from '@/components/FormDialog.vue';
  import ConfirmDialog from '@/components/ConfirmDialog.vue';
  import LineForm from '@/views/line_AI/LineForm.vue';
  import draggable from 'vuedraggable';

  /** Setup */
  const emit = defineEmits(['update:linesByCrew', 'view-line', 'new-line', 'update-lines', 'delete-line']);
  /**
   * @type {import('vue').DefineProps<{
   *   linesByCrew: Object,
   *   area: Area,
   *   crews: Crew[],
   *   lineGroup: LineGroup
   * }>}
   */
  const props = defineProps({
    linesByCrew: {
      type: Object,
      required: true,
    },
    area: {
      type: Object,
      required: true,
    },
    crews: {
      type: Array,
      required: true,
    },
    lineGroup: {
      type: Object,
      required: true,
    },
  });
  const facilityStore = useFacilityStore();
  const LINE = new LineRepository();
  /** @param {import('@/types/context.js').LineContextData} LineContextData */
  const LineContextData = { areaSlug: props.area.slug }
  const {
    loading,
    formData,
    showDialog,
    isEdit,
    openCreate,
    openEdit,
    save,
    requestDelete,
    confirmDelete,
    showDeleteConfirm,
    itemToDelete,
  } = useCrud(LINE, LineContextData);

  /** State */
  const expandedCrews = ref([]);
  const _linesByCrew = ref({});

  /** Computed */

  /** Methods */
  function toggleCrew (crewId) {
    const index = expandedCrews.value.indexOf(crewId);
    if (index === -1) {
      expandedCrews.value.push(crewId);
    } else {
      expandedCrews.value.splice(index, 1);
    }
  }
  function getEmployeeTypeProps (employeeTypeId) {
    /** @type {import('@/types').Employeetype} type */
    const type = facilityStore.employeeTypes.find(type => type.id === parseInt(employeeTypeId));
    const name = type ? type.type_name : '';

    if (name === 'Full-Time') { // Full-Time
      return {
        color: 'green',
        icon: 'circle',
      };
    } else if (name === 'Trainee') { // Trainee
      return {
        color: 'blue',
        icon: 'circle-half-stroke',
      };
    } else if (name === 'R Trainee') { // Trainee
      return {
        color: 'blue',
        icon: 'fa-kit fa-circle-r',
      };
    } else
      if (name === 'D Trainee') { // Trainee
        return {
          color: 'blue',
          icon: 'fa-kit fa-circle-d',
        };
      }
      else { // Any other type
        return {
          color: 'grey',
          icon: 'circle-question',
        };
      }
  }
  function handleCreateLine () {
    openCreate({
      details: [{
        id: null,
        start: new Date(props.lineGroup.start_day),
        su: '',
        su_length: null,
        mo: '',
        mo_length: null,
        tu: '',
        tu_length: null,
        we: '',
        we_length: null,
        th: '',
        th_length: null,
        fr: '',
        fr_length: null,
        sa: '',
        sa_length: null,
      }],
      hours: 8,
      repeat: 'default',
      area_id: props.area.id,
      crew_id: null,
      line_group_id: props.lineGroup.id,
      year: facilityStore.facility.bid_year,
    });
  }
  function handleSubmit () {
    // Save the line using the useCrudLine save method
    save(
      line => {
        console.log('[LineList] - isEdit = ' + isEdit.value)
        // Success callback - emit the line up to the parent component
        if (isEdit.value) {
          emit('update-lines', [line]);
          console.log('[LineList] - Emit update-line event', line);
        } else {
          emit('new-line', line);
          console.log('[LineList] - Emit new-line event', line);
        }
      },
      error => {
        // Error callback
        console.error('Error saving line:', error);
      }
    );
  }
  function handleConfirmDelete () {
    confirmDelete(
      lines => {
        // Success callback
        console.log(
          '[LineList] - Emit delete-line event',
          lines,
        )
        emit('delete-line', { deletedLine: itemToDelete.value, lines });

      },
      error => {
        // Error callback
        console.error('Error deleting line:', error);
      }
    );
  }


  /** Actions */
  const onLineDropped = async (event, crew) => {
    const { removed } = event;
    if (removed) return;

    console.log('Line drop event:', event);

    const changes = _linesByCrew.value[crew.id].map((line, index) => ({
      id: line.id,
      original_order: line.original_order,
      order: index,
      original_crew_id: line.original_crew_id,
      crew_id: crew.id,
    })).filter(l => l.original_order !== l.order || l.original_crew_id !== l.crew_id);

    if (changes.length === 0) return;

    try {
      // Update the API
      const context = {
        areaSlug: props.area.slug,
        data: changes,
      };
      const r = await LINE.order(context);
      console.log('[LineList] - Changes after successful save:', r.data);
      emit('update-lines', r.data);
    } catch (e) {
      console.error('Error updating line order:', e);
    }
  }
  const duplicateLine = async line => {
    // Duplicate the line
    const context = {
      areaSlug: props.area.slug,
      id: line.id,
    };
    const r = await LINE.duplicate(context);
    console.log('[LineList] - Duplicate line response:', r.data);
    emit('new-line', r.data);
  }

  /** Watchers */
  watch(() => props.linesByCrew, val => {
    // Create a deep copy of the props.linesByCrew to avoid modifying props directly
    const result = {};

    // Initialize with empty arrays for each crew
    props.crews.forEach(crew => {
      result[crew.id] = [];
    });

    // Populate with lines from props, adding tracking properties
    Object.entries(val).forEach(([crewId, lines]) => {
      result[crewId] = lines.map((line, index) => ({
        ...line,
        original_order: line.original_order !== undefined ? line.original_order : index,
        original_crew_id: line.original_crew_id !== undefined ? line.original_crew_id : parseInt(crewId),
      }));
    });

    _linesByCrew.value = result;
  }, { deep: true, immediate: true })

  /** Lifecycle */
  onMounted(() => {
    // Expand all groups by default when component is mounted
    expandedCrews.value = props.crews.map(crew => crew.id);
  });


  /** REVIEW */
  function viewLine (item) {
    emit('view-line', item);
  }
  </script>

<style scoped>
.custom-table {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    overflow: hidden;
}
.custom-table-header {
    background-color: #f5f5f5;
    font-weight: 500;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
.custom-table-row {
    position: relative;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    border-bottom-width: 3px;
}
.actions-cell {
    width: 120px;
    min-width: 120px;
}
.actions-header {
    width: 120px;
    min-width: 120px;
}
.name-header, .init-header, .name-cell {
    width: 150px;
}
.init-cell {
    width: 50px;
    margin: 0 5px;
}
.name-cell {
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.1);
    border-width: 0 1px;
    box-sizing: border-box;
}
.rdo {
    color: #2b2d42;
    font-weight: bolder;
}
.custom-table-row {
    box-sizing: border-box;
    border-bottom-style: solid;
    box-shadow: none;
    transition: border-color 0.3s;
}
.rdo:before {
    content: 'RDO';
}
.day-grid {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0;
    width: 100%;
    height: 100%;
}
.day-col {
    flex: 1 1 0;
    min-width: 0;
    width: 14.28%;
    padding: 0 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.1);
    border-width: 0 1px;
    box-sizing: border-box;
}
.day-header {
    font-weight: bold;
    padding: 2px 0;
    margin-bottom: 2px;
    border-radius: 2px;
}
.line-handle {
    cursor: grab;
    display: inline-flex;
    padding: 2px;
}
</style>
