import { ref } from 'vue'

export function useCrud (repo, context = {}) {
  const loading = ref(false)
  const formData = ref({}) // Model being edited or created - set by 'open' methods
  const showDialog = ref(false)
  const isEdit = ref(false)

  const openCreate = (defaults = {}) => {
    formData.value = { ...defaults }
    console.log('[useCrud] - defaults', defaults)
    console.log('[useCrud] - openCreate', formData.value)
    isEdit.value = false
    showDialog.value = true
  }

  const openEdit = item => {
    formData.value = { ...item }
    isEdit.value = true
    showDialog.value = true
  }

  const itemToDelete = ref(null)
  const showDeleteConfirm = ref(false)

  const requestDelete = item => {
    itemToDelete.value = item
    showDeleteConfirm.value = true
  }

  const confirmDelete = async (onSuccess = () => {
  }, onError = () => {
  }, addContext = {}) => {
    if (!itemToDelete.value) return
    try {
      loading.value = true

      // Set the context
      const contextData = {
        ...context,
        id: itemToDelete.value.id,
        ...addContext,
      }
      const r = await repo.delete(contextData)

      // Handle success
      onSuccess(r.data)
      showDeleteConfirm.value = false
      itemToDelete.value = null
    } catch (e) {
      onError(e)
    } finally {
      loading.value = false
    }
  }

  const save = async (onSuccess = () => {
  }, onError = () => {
  }, addContext = {}) => {
    loading.value = true
    console.log('[useCrud]-before try', formData.value)
    try {
      let result
      const contextData = {
        ...context,
        data: formData.value,
        id: formData.value.id,
        ...addContext,
      }
      console.log('[useCrud]-contextData', contextData)
      if (isEdit.value) {
        result = await repo.update(contextData)
      } else {
        result = await repo.create(contextData)
      }

      showDialog.value = false
      onSuccess(result.data)
    } catch (e) {
      onError(e)
    } finally {
      loading.value = false
    }
  }

  const destroy = async (item, onSuccess = () => {}, onError = () => {}, addContext = {}) => {
    try {
      // Set the context
      const contextData = {
        ...context,
        id: item.id,
        ...addContext,
      }
      await repo.delete(contextData)
      onSuccess(item)
    } catch (e) {
      onError(e)
    }
  }

  return {
    loading,
    formData,
    showDialog,
    isEdit,
    openCreate,
    openEdit,
    save,
    destroy,
    requestDelete,
    confirmDelete,
    showDeleteConfirm,
    itemToDelete,
  }
}
