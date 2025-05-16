// @/api/repos/RosterTeamRepository.js
import apiClient from '@/api/client.js';


class RosterTeamRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').RosterTeamContextData} context */
  get (context) {
    const { areaSlug, rosterId, id } = context;
    const path = id ? `/${id}` : ''
    return this.client.get(`/${areaSlug}/rosters/${rosterId}/rosterteams` + path)
  }
  /** @param {import('@/types/context').RosterTeamContextData} context */
  create (context) {
    const { areaSlug, rosterId, data } = context;
    return this.client.post(`/${areaSlug}/rosters/${rosterId}/rosterteams`, data)
  }
  /** @param {import('@/types/context').RosterTeamContextData} context */
  update (context) {
    const { areaSlug, rosterId, id, data } = context;
    return this.client.put(`/${areaSlug}/rosters/${rosterId}/rosterteams/${id}`, data)
  }
  /** @param {import('@/types/context').RosterTeamContextData} context */
  delete (context) {
    const { areaSlug, rosterId, id } = context;
    return this.client.delete(`/${areaSlug}/rosters/${rosterId}/rosterteams/${id}`)
  }
  /** @param {import('@/types/context').RosterTeamContextData} context */
  addTeamMembers (context) {
    const { areaSlug, rosterId, id, data } = context;
    return this.client.put(`/${areaSlug}/rosters/${rosterId}/rosterteams/${id}/add-members`, data)
  }
  /** @param {import('@/types/context').RosterTeamContextData} context */
  removeTeamMembers (context) {
    const { areaSlug, rosterId, id, data } = context;
    return this.client.post(`/${areaSlug}/rosters/${rosterId}/rosterteams/${id}/remove-members`, data)
  }
  /** @param {import('@/types/context').RosterTeamContextData} context */
  orderTeams (context) {
    const { areaSlug, rosterId, data } = context;
    return this.client.put(`/${areaSlug}/rosters/${rosterId}/rosterteams/order-teams`, { changes: data })
  }
  /** @param {import('@/types/context').RosterTeamContextData} context */
  orderMembers (context) {
    const { areaSlug, rosterId, id, data } = context;
    return this.client.put(`/${areaSlug}/rosters/${rosterId}/rosterteams/${id}/order-members`, { changes: data })
  }
}
export default RosterTeamRepository;
