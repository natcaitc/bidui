<template>
  <v-dialog v-model="internalModel" max-width="400">
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>
        <slot>
          Are you sure you want to continue?
        </slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="internalModel = false">Cancel</v-btn>
        <v-btn color="error" prepend-icon="trash" variant="elevated" @click="confirm">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
    title: String,
  })
  const emit = defineEmits(['update:modelValue', 'confirm'])

  const internalModel = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
  })

  const confirm = () => {
    emit('confirm')
    internalModel.value = false
  }
</script>
