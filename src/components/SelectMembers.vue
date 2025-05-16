<template>
  <div>
    <!-- Trigger button/element provided by the parent -->
    <div @click="showDialog = true">
      <slot />
    </div>

    <!-- Selection Dialog -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h5">
          Select Members
        </v-card-title>

        <v-card-text>
          <!-- Search Input Field -->
          <v-text-field
            v-model="searchTerm"
            append-inner-icon="magnifying-glass"
            class="mb-2"
            clearable
            density="compact"
            hide-details
            label="Search Members"
            :loading="isSearching"
            placeholder="Enter name to search"
            variant="outlined"
            @input="debouncedSearch"
          />

          <!-- Search Results List -->
          <div v-if="searchResults.length > 0 && !isSearching" class="search-results mb-4">
            <v-list class="bg-grey-lighten-4 rounded" density="compact" lines="two">
              <v-list-subheader>Search Results</v-list-subheader>
              <v-list-item
                v-for="member in searchResults"
                :key="member.id"
                :value="member.id"
                @click="selectMember(member)"
              >
                <template #prepend>
                  <v-avatar class="mr-2" color="primary" size="32">
                    <v-icon color="white" size="small">user</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ member.lname }}, {{ member.fname }}</v-list-item-title>
                <v-list-item-subtitle class="text-uppercase">{{ member.facility }}</v-list-item-subtitle>
                <template #append>
                  <v-icon
                    color="primary"
                    size="small"
                    @click.stop="selectMember(member)"
                  >plus</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <!-- No Results Message -->
          <v-alert
            v-if="searchPerformed && searchResults.length === 0 && !isSearching"
            class="mb-4"
            density="compact"
            type="info"
            variant="tonal"
          >
            No members found matching your search criteria.
          </v-alert>

          <!-- Selected Members List -->
          <div v-if="_selected.length > 0" class="selected-members">
            <v-list-subheader>Selected Members</v-list-subheader>
            <v-chip-group column wrap>
              <v-chip
                v-for="member in _selected"
                :key="member.id"
                class="ma-1"
                closable
                color="primary"
                variant="outlined"
                @click:close="removeMember(member)"
              >
                {{ member.lname }}, {{ member.fname }} (<span class="text-uppercase">{{ member.facility }}</span>)
              </v-chip>
            </v-chip-group>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            variant="text"
            @click="cancelSelection"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="_selected.length === 0"
            variant="elevated"
            @click="confirmSelection"
          >
            Add {{ _selected.length }} Members
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  // Imports
  import { computed, ref, watch } from 'vue'
  import { MemberRepository } from '@/api'
  import { useDebounceFn } from '@vueuse/core'
  import { useRoute } from 'vue-router'

  // Setup
  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => [],
    },
    excludeIds: {
      type: Array,
      default: [],
    },
    maxSelections: {
      type: Number,
      default: null,
    },
    teamId: {
      type: [String, Number],
      default: null,
    },
  })
  const emit = defineEmits(['update:modelValue', 'selection-confirmed', 'selection-canceled'])
  const route = useRoute()
  const MEMBER = new MemberRepository()

  // State
  const showDialog = ref(false)
  const searchTerm = ref('')
  const _selected = ref([])
  const searchResults = ref([])
  const isSearching = ref(false)
  const searchPerformed = ref(false)

  // Methods
  const debouncedSearch = useDebounceFn(async () => {
    if (!searchTerm.value.trim()) return

    isSearching.value = true
    searchPerformed.value = true

    try {
      const criteria = {
        term: searchTerm.value.trim(),
        excludeIds: [..._selected.value.map(m => m.id), ...props.excludeIds],
      }

      if (props.teamId) {
        criteria.teamId = props.teamId
      }

      const response = await MEMBER.search(route.params.area, criteria)
      searchResults.value = response.data.filter(member =>
        !_selected.value.some(selected => selected.id === member.id)
      )
    } catch (error) {
      console.error('Error searching members:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)

  /** Watchers */
  // Make sure dialog is open before making changes
  watch(() => props.modelValue, newVal => {
    if (showDialog.value) {
      _selected.value = [...newVal]
    }
  }, { immediate: true, deep: true })
  // Show selected members if they are in the v-model already
  watch(showDialog, isOpen => {
    if (isOpen) {
      _selected.value = [...props.modelValue]
      // Reset search
      searchTerm.value = ''
      searchResults.value = []
      searchPerformed.value = false
    }
  })
  // Clear search results if the input is cleared
  watch(searchTerm, (newVal, oldVal) => {
    if (oldVal && !newVal) {
      // Input was just cleared
      searchResults.value = []
      searchPerformed.value = false
    }
  })

  /** Methods */
  // Select a member from the search results
  const selectMember = member => {
    if (!canSelectMore.value) {
      // Could show a message about max selections reached
      return
    }

    _selected.value.push(member)

    // Clear the selected member from search results
    searchResults.value = searchResults.value.filter(m => m.id !== member.id)
  }
  // Remove member from the selected array
  const removeMember = member => {
    _selected.value = _selected.value.filter(m => m.id !== member.id)
  }
  // Submit the selection
  const confirmSelection = () => {
    emit('update:modelValue', _selected.value)
    emit('selection-confirmed', _selected.value)
    showDialog.value = false
    _selected.value = []
  }
  // Cancel the selection
  const cancelSelection = () => {
    emit('selection-canceled')
    showDialog.value = false
  }

  /** Computed */
  // Optionally restrict max selections
  const canSelectMore = computed(() => {
    if (!props.maxSelections) return true
    return _selected.value.length < props.maxSelections
  })

  /** Expose */
  defineExpose({
    openDialog: () => {
      showDialog.value = true
    },
    closeDialog: () => {
      showDialog.value = false
    },
  })
</script>

<style scoped>
.search-results {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
