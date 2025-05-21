<template>
  <v-form class="line-form">
    <h3>Shift Definitions</h3>
    <div class="d-flex text-center border-bottom">
      <div v-if="_line.repeat === 'span'" class="flex-grow-1">Start Day</div>
      <div class="flex-grow-1">SU</div>
      <div class="flex-grow-1">MO</div>
      <div class="flex-grow-1">TU</div>
      <div class="flex-grow-1">WE</div>
      <div class="flex-grow-1">TH</div>
      <div class="flex-grow-1">FR</div>
      <div class="flex-grow-1">SA</div>
    </div>
    <div
      v-for="(detail, idx) in _line.details"
      :key="idx"
      class="d-flex border-bottom mt-2"
    >
      <v-tooltip
        v-if="!isValid(detail)"
        location="top"
        text="Hours for this week do not equal 40!"
      >
        <template #activator="{ props: tProps }">
          <v-icon
            v-bind="tProps"
            class="text-warning mr-2 mt-2"
            icon="triangle-exclamation"
            size="large"
          />
        </template>
      </v-tooltip>

      <div v-if="_line.repeat === 'span'" class="col-sm-2">
        <v-date-picker
          v-model="detail.start"
          :max="lineGroup.end_day"
          :min="lineGroup.start_day"
        />
      </div>

      <div class="flex-grow-1 mr-3">
        <shift-input
          :index="idx"
          name="su"
          :shift-length-default="_line.hours"
          :value="detail"
          @update:value="updateDetail(idx, $event)"
        />
      </div>
      <div class="flex-grow-1 mr-3">
        <shift-input
          :index="idx"
          name="mo"
          :shift-length-default="_line.hours"
          :value="detail"
          @update:value="updateDetail(idx, $event)"
        />
      </div>
      <div class="flex-grow-1 mr-3">
        <shift-input
          :index="idx"
          name="tu"
          :shift-length-default="_line.hours"
          :value="detail"
          @update:value="updateDetail(idx, $event)"
        />
      </div>
      <div class="flex-grow-1 mr-3">
        <shift-input
          :index="idx"
          name="we"
          :shift-length-default="_line.hours"
          :value="detail"
          @update:value="updateDetail(idx, $event)"
        />
      </div>
      <div class="flex-grow-1 mr-3">
        <shift-input
          :index="idx"
          name="th"
          :shift-length-default="_line.hours"
          :value="detail"
          @update:value="updateDetail(idx, $event)"
        />
      </div>
      <div class="flex-grow-1 mr-3">
        <shift-input
          :index="idx"
          name="fr"
          :shift-length-default="_line.hours"
          :value="detail"
          @update:value="updateDetail(idx, $event)"
        />
      </div>
      <div class="flex-grow-1">
        <shift-input
          :index="idx"
          name="sa"
          :shift-length-default="_line.hours"
          :value="detail"
          @update:value="updateDetail(idx, $event)"
        />
      </div>
      <v-btn
        class="mt-2 text-error"
        prepend-icon="trash"
        variant="text"
        @click="_line.details.splice(idx, 1)"
      />
    </div>

    <div class="text-right">
      <v-btn
        class="mt-2"
        color="success"
        density="compact"
        prepend-icon="plus"
        variant="elevated"
        @click="lineDetailAdd"
      >
        Add Week
      </v-btn>
    </div>

    <h6 class="mt-4">Line Options</h6>
    <v-row class="text-center">
      <v-col>
        <v-select
          v-model="_line.employee_type_id"
          item-title="type_name"
          item-value="id"
          :items="employeeTypes"
          label="Select Employee Type"
          required
          :rules="[v => !!v || 'Employee Type is required']"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="_line.crew_id"
          :disabled="!create"
          item-title="name"
          item-value="id"
          :items="crews"
          label="Select Crew"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="_line.hours"
          item-title="name"
          item-value="id"
          :items="lineHours"
          label="Select Line Hours"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="_line.repeat"
          item-title="name"
          item-value="id"
          :items="lineRepeat"
          label="Select Repeat Pattern"
        />
      </v-col>
    </v-row>

    <v-row class="mt-3">
      <v-col>
        <v-textarea
          v-model="_line.notes"
          label="Notes"
          rows="3"
        />
      </v-col>
      <v-col cols="3">
        <v-color-picker
          v-model="_line.bgcolor"
          hide-inputs
          hide-sliders
          label="Background Color"
          show-swatches
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
  /** Imports */
  import { computed } from 'vue';
  import ShiftInput from './ShiftInput.vue';

  /** Setup */
  const emit = defineEmits(['update:line']);
  /**
   * @type {import('vue').DefineProps<{
   *   line: Line,
   *   lineGroup: LineGroup,
   *   crews: Crew[],
   *   employeeTypes: EmployeeType[],
   *   create: boolean,
   * }>}
   */
  const props = defineProps({
    line: { // Line
      type: Object,
      required: true,
    },
    lineGroup: {
      type: Object,
      required: true,
    },
    crews: {
      type: Array,
      required: true,
    },
    employeeTypes: {
      type: Array,
      required: true,
    },
    create: {
      type: Boolean,
      default: false,
    },
    // creatingCrewId: {
    //   type: Number,
    //   default: null,
    // },
    // modelValue: {
  });

  /** Computed */
  const _line = computed({
    get: () => props.line,
    set: val => emit('update:line', val),
  })


  // Stores


  // Line repository
  // const { create, update, loading } = useLineRepository();

  // Available line hours
  const lineHours = [
    { id: 8, name: '8 Hour' },
    { id: 10, name: '10 Hour' },
    { id: 99, name: 'Other...' },
  ];

  // Available line repeat options
  const lineRepeat = [
    { id: 'default', name: 'Default Repeating Pattern' },
    { id: 'span', name: 'Repeat By Dates' },
  ];


  // Computed properties
  // const crewId = computed(() => {
  //   return props.creatingCrewId || _line.value.crew_id;
  // });

  /** Methods */
  function isValid (detail) {
    // Check if the total hours for the week equals 40
    const hours = Object.entries(detail).reduce((total, [key, value]) => {
      if (key.endsWith('_length') && value) {
        return total + parseInt(value);
      }
      return total;
    }, 0);

    return hours === 40;
  }

  const lineDetailAdd = () => {
    console.log(_line.value)
    // Add a new detail row
    _line.value.details.push({
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
    });
  };

  const updateDetail = (idx, updatedDetail) => {
    // Update a detail row
    _line.value.details[idx] = updatedDetail;
  };

  // const save = async () => {
  //   try {
  //     if (props.creatingCrewId !== null) {
  //       // Create new line
  //       const response = await create(Line.value);
  //       emit('created', response.data);
  //     } else {
  //       // Update existing line
  //       const response = await update(Line.value.id, Line.value);
  //       emit('saved', response.data);
  //     }
  //     emit('close');
  //   } catch (error) {
  //     console.error('Error saving line:', error);
  //   }
  // };

  // Initialize component
  // watch(() => props.modelValue, newVal => {
  //   Line.value = { ...newVal };
  //   formatDetailDates();
  // }, { immediate: true, deep: true });

  // Update modelValue when Line changes
  // watch(Line, newVal => {
  //   emit('update:modelValue', newVal);
  // }, { deep: true });
</script>

<style scoped>
.line-form {
  padding: 20px;
}
</style>
