// router/authGuard.js
/**
 * @typedef {import('vue-router').RouteMeta & { permission?: string }} CustomRouteMeta
 */
import { useAuthStore } from '@/stores/auth'
import { logError } from '@/utils/logError.js';
import { useToastStore } from '@/stores/toasts';

/**
 * @param {import("vue-router").Router} router
 */
export function setupAuthGuard (router) {
  router.beforeEach(
    /**
     * @param {import('vue-router').RouteLocationNormalized} to
     * @param {import('vue-router').RouteLocationNormalized} from
     * @param {(to?: string | false | void | import('vue-router').RouteLocationRaw) => void} next
     */
    async (to, from, next) => {
      /** @type {CustomRouteMeta} */
      const meta = to.meta
      const auth = useAuthStore()
      const requiresAuth = !!meta.permission
      console.log('[authGuard] Checking if there is already a user', auth.user, auth.loading)

      // Check if there is a user
      if (!auth.user && !auth.loading) {
        try {
          await auth.getUser()
          console.log('[authGuard] Current AUTH user:', auth.user)
          if (!auth.user) {
            console.warn('[authGuard] No user returned, redirecting')

            return notLoggedIn()
          }
        } catch (e) {
          await logError(e, { tag: 'auth:authGuard' })
          return notLoggedIn()
        }
      }

      /**
     * Handles scenarios for unauthenticated access to routes that require authentication.
     * Redirects the user with an appropriate error message if they are not logged in and the route
     *
     *
     * @return {void|Object} Either proceeds to the next route or returns a redirection path object.
     */
      function notLoggedIn () {
      // See if the route requires authentication before throwing an error and redirecting
        if (!requiresAuth) {
          // Allow access to routes that don't require authentication
          return next()
        }

        const toast = useToastStore();
        console.warn('[authGuard] Not logged in, redirecting')
        toast.showMessage({ message: 'You must be logged in to access this page.', color: 'error' })

        // Determine where to redirect
        const errorPath = to.params.facility && !to.params.permissions ? { name: 'facility.home', params: { facility: to.params.facility } } : { name: 'home' }

        return next(errorPath.name === to.params.name ? '' : errorPath)
      }
      console.log('[authGuard] Current AUTH user:', auth.user)


      // Check permissions
      const requiredPermission = meta?.permission
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
