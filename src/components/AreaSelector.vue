<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" :disabled="!areas.length">
        {{ currentAreaName || 'Select Area' }}
        <v-icon class="ms-1">caret-down</v-icon>
      </v-btn>
    </template>

    <v-list density="compact">
      <v-list-item
        v-for="area in areas"
        :key="area.id"
        @click="selectArea(area)"
      >
        <v-list-item-title :class="isCurrentArea(area) ? 'font-weight-bold' : ''">{{ area.name }}</v-list-item-title>
        <template #append>
          <v-icon
            v-if="isCurrentArea(area)"
            class="ms-2"
            color="success"
            size="18"
          >
            check
          </v-icon>
        </template>
      </v-list-item>

      <v-list-item
        v-if="!areas.length && facility"
        disabled
        prepend-icon="info"
        title="No areas available"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
  /** Imports */
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useFacilityStore } from '@/stores/facility'
  import { useAreaStore } from '@/stores/area'

  /** Setup */
  const router = useRouter()
  const facilityStore = useFacilityStore()
  const areaStore = useAreaStore()

  /** State */
  const facility = facilityStore.facility
  const areas = areaStore.areas

  // Computed properties
  const currentArea = computed(() => areaStore.area)
  const currentAreaName = computed(() => currentArea.value?.name || '')

  // Get areas for the current facility
  // const areas = computed(() => {
  //   if (!facility.value?.id) return []
  //   return facilityStore.areas || []
  // })

  // Check if area is the current selected area
  const isCurrentArea = area => {
    return currentArea.value?.id === area.id
  }

  // Navigate to the selected area
  const selectArea = area => {
    if (!facility.id) return

    // Navigate to the area page
    router.push({
      name: 'area.home',
      params: {
        facility: facility.id,
        area: area.slug,
      },
    })
  }
</script>

<style scoped>
.v-list-item-title {
    font-size: 0.8rem;
}
.v-list-item {
min-height: 30px;
}
</style>
