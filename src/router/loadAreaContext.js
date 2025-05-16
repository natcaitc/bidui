import { useAreaStore } from '@/stores/area'

export async function loadAreaContext (areaSlug) {
  const areaStore = useAreaStore()
  // Set the selected area
  areaStore.area = areaStore.areas.find(area => area.slug === areaSlug)
  // Make sure the area in the store matches the one being loaded
  if (!areaStore.area || areaStore.area.slug !== areaSlug) {
    // await areaStore.fetchArea(areaId)
    console.log('[areaContext]', areaStore.area)
    // Only load dependencies once facility is confirmed
    await Promise.all([
      // useAreaStore().fetchAreas(),
      // useAuthStore().getScope(areaId),
    ])
  }
}
