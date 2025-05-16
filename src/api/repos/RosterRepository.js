// @/api/repos/RosterRepository.js
import apiClient from '@/api/client.js';

class RosterRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').RosterContextData} context */
  get (context) {
    const { areaSlug, id, bidYear } = context;
    const path = `${areaSlug}/rosters` + (id ? `/${id}` : '')
    return this.client.get(path, { bidYear })
  }
  /** @param {import('@/types/context').RosterContextData} context */
  create (context) {
    const { areaSlug, data } = context;
    return this.client.post(`/${areaSlug}/rosters`, data)
  }
  /** @param {import('@/types/context').RosterContextData} context */
  update (context) {
    const { areaSlug, id, data } = context;
    return this.client.put(`/${areaSlug}/rosters/${id}`, data)
  }
  /** @param {import('@/types/context').RosterContextData} context */
  delete (context) {
    const { areaSlug, id } = context;
    return this.client.delete(`/${areaSlug}/rosters/${id}`)
  }
  /** @param {import('@/types/context').RosterContextData} context */
  teamsMembers (context) {
    const { areaSlug, id } = context;
    return this.client.get(`/${areaSlug}/rosters/${id}/teams-members`)
  }
}
export default RosterRepository;
