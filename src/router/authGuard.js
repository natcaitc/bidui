// router/authGuard.js
import { useAuthStore } from '@/stores/auth'
import { logError } from '@/utils/logError.js';
import apiClient from '@/api/client'

export function setupAuthGuard (router) {
  router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()

    // 🕒 Wait until apiClient is ready (BootAuth0 finished)
    if (!apiClient.tokenReady) {
      console.log('[authGuard] Waiting for apiClient to be ready...')
      let attempts = 0
      while (!apiClient.tokenReady && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (!apiClient.tokenReady) {
        console.warn('[authGuard] apiClient still not ready. Redirecting.')
        return next({ path: '/' })
      }
    }

    // 👤 If no user and not loading, try to fetch
    if (!auth.user && !auth.loading) {
      try {
        await auth.getUser()
        if (!auth.user) {
          console.warn('[authGuard] No user returned, redirecting')
          return next({ path: '/' })
        }
      } catch (e) {
        await logError(e, { tag: 'auth:authGuard' })
        return next({ path: '/' })
      }
    }

    next()
  })
}
