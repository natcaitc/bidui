<template>
  <v-dialog v-model="dialogOpen" max-width="600">
    <v-card>
      <v-card-title class="text-h6">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef">
          <slot :data="formData" />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          prepend-icon="floppy-disk"
          variant="elevated"
          @click="submit"
        >
          {{ actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { ref } from 'vue'
  import { computed } from 'vue'

  const dialogOpen = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val),
  })

  const props = defineProps({
    modelValue: Boolean,
    formData: {
      type: Object,
      default: () => ({}),
    },
    title: { type: String, default: 'Form' },
    actionLabel: { type: String, default: 'Save' },
    loading: Boolean,
  })
  const internalFormData = ref({ ...props.formData })

  const emit = defineEmits(['update:modelValue', 'update:formData', 'submit'])
  const formRef = ref(null)

  const close = () => emit('update:modelValue', false)
  const submit = () => emit('submit', { ...props.formData })


  watch(() => props.formData, val => {
    console.log('formData changed', val)
    internalFormData.value = { ...val }
  }, { immediate: true, deep: true })

  watch(internalFormData, val => {
    console.log('internalFormData changed', val)
    emit('update:formData', { ...val })
  }, { deep: true })

</script>
