import { useAreaStore } from '@/stores/area'

export async function loadAreaContext (areaSlug) {
  const areaStore = useAreaStore()

  // Track the previous and new area
  /** @type {import('@/types').Area | null} newArea */
  const currentArea = areaStore.area
  /** @type {import('@/types').Area | null} newArea */
  const newArea = areaStore.areas.find(area => area.slug === areaSlug)

  // Set the new area
  areaStore.area = newArea
  console.log('[areaContext]', newArea, currentArea)
  // See if this is a change so dependencies get loaded properly
  if (!currentArea || currentArea.slug !== newArea.slug) {
    // await areaStore.fetchArea(areaId)
    console.log('[areaContext]', newArea)
    // Only load dependencies once facility is confirmed
    await Promise.all([
      useAreaStore().fetchCrews(),
      // useAreaStore().fetchAreas(),
      // useAuthStore().getScope(areaId),
    ])
  }
}
