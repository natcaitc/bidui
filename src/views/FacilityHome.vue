<template>
  <v-container class="facility-container fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="editor-column d-flex flex-column fill-height" cols="12">
        <RichTextEditor v-model="content.content" class="flex-grow-1" @save="updateContent" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
  /* Imports */
  import { onMounted, ref } from 'vue'
  import RichTextEditor from '@/components/RichTextEditor.vue'
  import { ContentRepository } from '@/api/index.js';
  import { useToastStore } from '@/stores/toasts.js';
  import { getErrorMessage } from '@/utils/getErrorMessage.js';
  import { logError } from '@/utils/logError.js';

  /* Data */
  const toast = useToastStore();
  const CONTENT = new ContentRepository();//facilityStore.getId)
  /** @type {import('vue').Ref<import('@/types').Content>} */
  const content = ref({ id: null, content: '' })

  /* Methods */
  async function getContent () {
    try {
      const r = await CONTENT.get()
      if (r.data)
        content.value = r.data
    } catch (e) {
      await logError(e, { tag: 'facilityHome.getContent' })
    }
  }

  /**
   * @param {string} data - the HTML or markdown from the editor
   */
  async function updateContent (data) {
    try {
      const r = await CONTENT.update(content.value?.id, { content: data })
      if (r && r.status === 200) {
        toast.showMessage({
          title: 'Success',
          message: 'Facility homepage data saved successfully.',
          color: 'success',
        })
      }
    } catch (e) {
      console.log(e)
      toast.showMessage({
        title: 'Server Error',
        message: getErrorMessage(e),
        color: 'error',
      })
    }
  }

  /* Lifecycle */
  onMounted(() => {
    getContent()
  })
</script>

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
