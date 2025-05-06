// stores/authGuard.js
/* Imports */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AuthRepository, MemberRepository } from '@/api/index.js'
import { logError } from '@/utils/logError.js';
import permissions from '@/utils/permissions.js';
// import { useMemberStore } from './member'
// import { useAlertsStore } from './alerts'

export const useAuthStore = defineStore('auth', () => {
  /* State */
  const authRepository = new AuthRepository()
  const user = ref(null)
  const member = ref({})
  const scope = ref({})
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

    const inRoles = rule.roles.includes(role)
    const hasFacility = !!scope.value.facility_id && scope.value.facility_id === facilityId
    const hasArea = areaId ? (scope.value.areas || []).includes(areaId) : true

    console.log(`[can] permission: ${permission}, role: ${role}, inRoles: ${inRoles}, hasFacility: ${hasFacility}, hasArea: ${hasArea}`)

    if (!inRoles) return false
    if (rule.requiresFacility && !hasFacility) return false
    return !(rule.requiresArea && !hasArea)
  }
  const is = role => {
    if (!user.value) return false
    if (user.value.role_id === 'super') return true

    return roles.value.includes(role)
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


  const roles = computed(() => scope.value.roles || [])
  const role = computed(() => {
    return user.value ? roleNames[user.value.role_id] : null
  })
  const roleName = roleId => roleNames[roleId]
  const isScopeSet = facilityId => {
    return scope.value.facility_id === facilityId && !!scope.value.user_id
  }
  const hasRole = (facilityId, requiredRoles) => {
    const requestedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return (
      scope.value.facility_id === facilityId &&
      scope.value.user_id &&
      requestedRoles.some(role => roles.value.includes(role))
    )
  }
  const isLoggedInUser = memberID => {
    return user.value?.member_id === memberID
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
        loading.value = false
      } else {
        console.log('auth.getUser: user not found:', r.data)

        status.value = 'no-user'
      }
      return r.data
    } catch (e) {
      status.value = 'no-user'
      await logError(e, { tag: 'auth.getUser' })
      return null
    }
  }
  async function setUser (payload) {
    user.value = payload

    try {
      console.log('auth.setUser: setting user:', payload)
      // Fetch the member data
      const MEMBER = new MemberRepository()
      const r = await MEMBER.get(payload.member_id)
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


  function logout () {
    user.value = null
    scope.value = {}
    status.value = 'init'
    mocking.value = false
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
    roles,
    role,
    can,
    is,
    isAny,
    isAtLeast,
    // roleName,
    // isScopeSet,
    // hasRole,
    // is,
    // isLoggedInUser,

    // actions
    // logout,
    // mockUser,
    getUser,
    getScope,
  }
})
