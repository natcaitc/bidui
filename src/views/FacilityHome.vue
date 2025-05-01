<script setup>
  import { ref } from 'vue'
  import RichTextEditor from '@/composables/RichTextEditor.vue'
  import { ContentRepository } from '@/api/index.js';
  import { useToastStore } from '@/stores/toasts';
  import { useFacilitiesStore } from '@/stores/facilities.js'
  import { getErrorMessage } from '@/utils/getErrorMessage.js';

  const toast = useToastStore();
  const facility = useFacilitiesStore();
  const CONTENT = new ContentRepository(facility.facilityId)
  const content = ref('')

  // Fetch facility content
  CONTENT.get()
    .then(r => {
      console.log(r)
      content.value = r.data
    })
    .catch(e => {
      console.log(e)
      toast.showMessage({
        title: 'Server Error',
        message: getErrorMessage(e),
        color: 'error',
      })
    })

  function updateContent (data) {
    CONTENT.update(content.value.id, { content: data })
      .then(() => {
        toast.showMessage({
          title: 'Success',
          message: 'Facility homepage data saved successfully.',
          color: 'success',
        })
      })
      .catch(e => {
        console.log(e)
        toast.showMessage({
          title: 'Server Error',
          message: getErrorMessage(e),
          color: 'error',
        })
      })
  }
</script>

<template>
  <v-container class="facility-container fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="editor-column d-flex flex-column fill-height" cols="12">
        <RichTextEditor v-model="content.content" class="flex-grow-1" @save="updateContent" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.facility-container {
    padding: 16px;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
}
.editor-column{
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    height: 100%;
}

@media (max-width: 600px) {
    .facility-container {
        padding: 8px;
    }
    .editor-column {
        max-width: 90vw;
    }
}
</style>
