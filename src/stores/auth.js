// stores/auth.js

/* Imports */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AuthRepository, MemberRepository } from '@/api/index.js'
import { logError } from '@/utils/logError.js';
import permissions from '@/utils/permissions.js';
import { useFacilityStore } from './facility';
import { useAreaStore } from './area';
import { auth0 } from '@/plugins/auth0.js';

export const useAuthStore = defineStore('auth', () => {
  /* State */
  const authRepository = new AuthRepository()
  /** @type {import('vue').Ref<import('@/types').User|null>} */
  const user = ref(null)
  const member = ref({})
  /** @type {import('vue').Ref<import('@/types').Scope|null>} */
  const scope = ref(null)
  const status = ref('init') // 'init' | 'logged-in' | 'error' | 'no-user'
  const mocking = ref(false)
  const loading = ref(false)

  /* Constants */
  const roleNames = {
    guest: 'Guest',
    controller: 'Controller',
    bidaid: 'Bidder',
    arearep: 'Area Rep',
    admin: 'Facility Rep',
    super: 'Super User',
  }

  /* Getters */
  const loggedIn = computed(() => status.value === 'logged-in')

  /**
   * Determines if a user has the required permissions within a certain context.
   * !! Attempts to load Facility and Area context from the store
   *
   * @param {string} permission - The name of the permission to check, as defined in the permissions object.
   * @param {Object} [context={}] - Optional context for the permission check.
   * @param {number|null} [context.areaId=null] - The ID of the current area. If not provided, the current area's ID from the area store is used.
   * @param {string|null} [context.facilityId=null] - The ID of the current facility. If not provided, the current facility's ID from the facility store is used.
   * @returns {boolean} - Returns `true` if the user has the required permission, `false` otherwise.
   *
   * The function checks the user's role and context (facility and/or area) against pre-defined
   * permissions to determine if the action is allowed. Superusers are always granted permissions.
   * It also handles scenarios where the facility and area contexts are not provided, defaulting
   * to the current contexts from their respective stores.
   *
   * Logs details about the permission check process for debugging purposes.
   */
  const can = (permission, { areaId = null, facilityId = null } = {}) => {
    if (!user.value) {
      console.log('[can] No user')
      return false
    }

    const role = user.value.role_id
    if (role === 'super') {
      console.log('[can] super user always true')
      return true
    }

    const rule = permissions[permission]
    if (!rule) {
      console.log(`[can] Permission "${permission}" not defined`)
      return false
    }

    // Get current facility context if not provided
    if (!facilityId) {
      const facilityStore = useFacilityStore()
      facilityId = facilityStore?.facility?.id || null
    }

    // Get current area context if not provided
    if (!areaId) {
      const areaStore = useAreaStore()
      areaId = areaStore?.area?.id || null
    }

    const inRoles = rule.roles.includes(role)
    const hasFacility = !!scope.value && !!scope.value.facility_id && scope.value.facility_id === facilityId
    const hasArea = areaId ? (scope.value.areas || []).includes(areaId) : true

    console.log(`[can] permission: ${permission}, role: ${role}, inRoles: ${inRoles}, hasFacility: ${hasFacility}, hasArea: ${hasArea}`)

    if (!inRoles) return false
    if (rule.requiresFacility && !hasFacility) return false
    return !(rule.requiresArea && !hasArea)
  }
  const is = role => {
    if (!user.value) return false
    if (user.value.role_id === 'super') return true

    return user.value.role_id === role
  }
  const isAny = roles => {
    if (!user.value) return false
    if (user.value.role_id === 'super') return true

    return roles.includes(user.value.role_id)
  }
  const isAtLeast = role => {
    if (!user.value) return false

    const roleKeys = Object.keys(roleNames)
    const userIndex = roleKeys.indexOf(user.value.role_id)
    const targetIndex = roleKeys.indexOf(role)

    return userIndex >= targetIndex
  }

  const role = computed(() => {
    return user.value ? roleNames[user.value.role_id] : null
  })
  const isScopeSet = facilityId => {
    if (!scope.value) return false
    return scope.value.facility_id === facilityId && !!scope.value.user_id
  }

  /* Actions */
  async function getUser () {
    if (status.value !== 'init') return
    console.log('auth.getUser: status:', status.value)
    try {
      loading.value = true
      console.log('auth.getUser: calling getUser()')
      const r = await authRepository.getUser()
      if (r.data?.member_id) {
        console.log('auth.getUser: user found:', r.data)
        await setUser(r.data)
      } else {
        console.log('auth.getUser: user not found:', r.data)

        status.value = 'no-user'
      }
      loading.value = false
      return r.data
    } catch (e) {
      status.value = 'no-user'
      await logError(e, { tag: 'auth.getUser' })
      loading.value = false
      return null
    }
  }
  async function setUser (payload) {
    user.value = payload

    try {
      console.log('auth.setUser: setting user:', payload)
      // Fetch the member data
      const MEMBER = new MemberRepository()
      const r = await MEMBER.get({ id: payload.member_id })
      if (r.data)
        member.value = r.data

      // Update status and return
      status.value = 'logged-in'
      return { user: payload, member: member.value }
    } catch (e) {
      status.value = 'error'
      await logError(e, { tag: 'auth.setUser' })
    }
  }
  async function getScope (facilityId) {
    if (!facilityId || (isScopeSet(facilityId) && !mocking.value)) return

    try {
      loading.value = true
      console.log('auth.getScope: calling getScope()', user.value)
      const userId = mocking.value ? user.value?.id : null // If mocking - send the user ID - otherwise let backend decide user
      const r = await authRepository.getScope(facilityId, userId)
      scope.value = r.data
      loading.value = false
    } catch (e) {
      await logError(e, { tag: 'auth.getScope' })
      return null
    }
  }

  async function login () {
    const facilityStore = useFacilityStore()
    const path = `${window.location.origin}/login` + (facilityStore.facility ? `?facility=${facilityStore.facility.id}` : '')
    // Logging in with redirect - no need to update state since it will be lost
    await auth0.loginWithRedirect({
      authorizationParams: {
        redirect_uri: path,
      },
    })
  }

  async function logout () {
    // Logout redirects - nothing else to do here
    await auth0.logout({
      authorizationParams: {
        redirect_uri: window.location.origin + '/logout',
      },
    })
  }
  async function mockUser (payload) {
    mocking.value = !mocking.value

    if (payload.cancel) {
      try {
        const response = await authRepository.getUser()
        await setUser(response.data)
      } catch (error) {
        console.error('Error reverting mock user:', error)
      }
    } else {
      try {
        const result = await setUser(payload.user)
        await getScope(result.member.facility_id)
      } catch (error) {
        console.error('Error setting mock user:', error)
      }
    }
  }


  /* Return */
  return {
    // state
    user,
    scope,
    status,
    mocking,
    member,
    loading,

    // getters
    loggedIn,
    role,
    can,
    is,
    isAny,
    isAtLeast,

    // actions
    getUser,
    getScope,
    login,
    logout,
  }
})

/** OLD DEFS */
// const roleName = roleId => roleNames[roleId]
// const hasRole = (facilityId, requiredRoles) => {
//   const requestedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
//   return (
//     scope.value.facility_id === facilityId &&
//     scope.value.user_id &&
//     requestedRoles.some(role => roles.value.includes(role))
//   )
// }
// const isLoggedInUser = memberID => {
//   return user.value?.member_id === memberID
// }
// const roles = computed(() => scope.value.roles || [])
