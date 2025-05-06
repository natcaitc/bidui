// router/authGuard.js
import { useAuthStore } from '@/stores/auth'
import { logError } from '@/utils/logError.js';
import apiClient from '@/api/client'
import { loadFacilityContext } from '@/router/loadFacilityContext.js';

export function setupAuthGuard (router) {
  router.beforeEach(async (to, from, next) => {
    /** @type {import('@/stores/auth').useAuthStore} */
    const auth = useAuthStore()
    console.log('[authGuard] Current AUTH user:', auth.user)

    console.log('[authGuard] Waiting for apiClient to be ready...')
    await apiClient.ready
    console.log('[authGuard] apiClient is ready.')
    // Wait until apiClient is ready (BootAuth0 finished)
    // if (!apiClient.tokenReady) {
    //   console.log('[authGuard] Waiting for apiClient to be ready...')
    //   let attempts = 0
    //   while (!apiClient.tokenReady && attempts < 50) {
    //     await new Promise(resolve => setTimeout(resolve, 100))
    //     attempts++
    //   }
    //
    //   if (!apiClient.tokenReady) {
    //     console.warn('[authGuard] apiClient still not ready. Redirecting.')
    //     return next({ path: '/' })
    //   }
    // }

    // If no user and not loading, try to fetch
    if (!auth.user && !auth.loading) {
      try {
        await auth.getUser()
        console.log('[authGuard] Current AUTH user:', auth.user)
        if (!auth.user) {
          console.warn('[authGuard] No user returned, redirecting')
          return next({ path: '/' })
        }
      } catch (e) {
        await logError(e, { tag: 'auth:authGuard' })
        return next({ path: '/' })
      }
    }
    console.log('[authGuard] Current AUTH user:', auth.user)


    // Try to load facility context if a facility is set
    if (to.params.facility) {
      console.log('[authGuard] Loading facility context for:', to.params.facility)
      try {
        await loadFacilityContext(to.params.facility);
        // next();
      } catch (e) {
        next({ name: 'home' });
        console.log(e)
      }
    }

    // Check permissions
    const requiredPermission = to.meta?.permission
    if (requiredPermission) {
      const hasPermission = auth.can(requiredPermission, {
        areaId: to.params.areaId,
        facilityId: to.params.facility,
      })
      console.log('[authGuard] Checking permission:', requiredPermission, '→', hasPermission)

      if (!hasPermission) {
        console.warn(`[authGuard] Permission denied for ${requiredPermission}`)
        return next({ name: 'auth.denied', query: { required: requiredPermission, role: auth.user?.role_id || 'none' } })
      }
    }
    next()
  })
}
