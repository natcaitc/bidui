<template>
  <div class="d-flex shift-input-group">
    <v-text-field
      v-model="shiftValue"
      class="shift-start"
      density="compact"
      hide-details
      maxlength="4"
      :name="uniqueName"
      placeholder="RDO"
      variant="outlined"
    />
    <v-text-field
      v-model="lengthValue"
      class="shift-length text-center"
      density="compact"
      hide-details
      :name="uniqueName + '_length'"
      :readonly="!shiftValue"
      tabindex="-1"
      variant="outlined"
    />
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';

  const props = defineProps({
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
    shiftLengthDefault: {
      type: [Number, String],
      default: 8,
    },
    index: {
      type: [Number, String],
      default: 0,
    },
  });

  const emit = defineEmits(['update:value']);

  // Use refs to track internal state
  const internalShift = ref(props.value[props.name] || '');
  const internalLength = ref(props.value[props.name + '_length'] || null);

  // Computed properties for two-way binding
  const uniqueName = computed(() => `${props.name}_${props.index}`);

  const shiftValue = computed({
    get: () => internalShift.value,
    set: val => {
      internalShift.value = val;
      // Update the length when shift changes
      if (val) {
        const length = props.shiftLengthDefault !== 99 ? props.shiftLengthDefault : 8;
        internalLength.value = length;
      } else {
        internalLength.value = null;
      }
      // Update the parent component
      updateParent();
    },
  });

  const lengthValue = computed({
    get: () => internalLength.value,
    set: val => {
      internalLength.value = val;
      // Update the parent component
      updateParent();
    },
  });

  // Method to update the parent component
  const updateParent = () => {
    const updatedValue = { ...props.value };
    updatedValue[props.name] = internalShift.value;
    updatedValue[props.name + '_length'] = internalLength.value;
    emit('update:value', updatedValue);
  };

  // Watch for changes in props
  watch(() => props.value[props.name], newVal => {
    if (newVal !== internalShift.value) {
      internalShift.value = newVal;
    }
  });

  watch(() => props.value[props.name + '_length'], newVal => {
    if (newVal !== internalLength.value) {
      internalLength.value = newVal;
    }
  });

  // Watch for changes in shiftLengthDefault
  watch(() => props.shiftLengthDefault, () => {
    if (internalShift.value) {
      internalLength.value = props.shiftLengthDefault;
      updateParent();
    }
  });
</script>

<style scoped>
.shift-start {
  width: 70px;
}
.shift-length {
  width: 50px;
}
</style>
