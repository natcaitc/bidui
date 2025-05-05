// stores/authGuard.js
/* Imports */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AuthRepository, MemberRepository } from '@/api/index.js'
import { logError } from '@/utils/logError.js';
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
  const is = (targetRole, areaId = null) => {
    if (!user.value) return false
    if (user.value.role_id === 'super') return true

    const inFacility = !!scope.value.facility_id
    const inArea = areaId ? (scope.value.areas || []).includes(areaId) : true

    return inFacility && roles.value.includes(targetRole) && inArea
  }
  const isLoggedInUser = memberID => {
    return user.value?.member_id === memberID
  }

  /* Actions */
  async function getUser () {
    if (status.value !== 'init') return
    console.log('auth.getUser: status:', status.value)
    try {
      console.log('auth.getUser: calling getUser()')
      const r = await authRepository.getUser()
      if (r.data?.member_id) {
        console.log('auth.getUser: user found:', r.data)
        await setUser(r.data)
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
  function logout () {
    user.value = null
    scope.value = {}
    status.value = 'init'
    mocking.value = false

    const alertsStore = useAlertsStore()
    alertsStore.newMessage({
      type: 'success',
      message: 'You have been successfully logged out of the system',
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

  async function getScope (facilityId) {
    if (!facilityId || (isScopeSet(facilityId) && !mocking.value)) return

    try {
      const userId = mocking.value ? user.value?.id : null
      const response = await authRepository.getScope(userId, facilityId)
      scope.value = response.data
    } catch (error) {
      throw error
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

    // getters
    loggedIn,
    roles,
    role,
    roleName,
    isScopeSet,
    hasRole,
    is,
    isLoggedInUser,

    // actions
    setUser,
    logout,
    mockUser,
    getUser,
    getScope,
  }
})
