// @/api/repos/RoundRepository.js
import apiClient from '@/api/client.js';

class RoundRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').RoundContextData} context */
  get (context) {
    const { areaSlug, id, bidYear } = context;
    const path = `${areaSlug}/rounds` + (id ? `/${id}` : '');
    return this.client.get(path, { bid_year: bidYear })
  }
  /** @param {import('@/types/context').RoundContextData} context */
  create (context) {
    const { areaSlug, data } = context;
    return this.client.post(`${areaSlug}/rounds`, data)
  }
  /** @param {import('@/types/context').RoundContextData} context */
  update (context) {
    const { areaSlug, id, data } = context;
    return this.client.put(`${areaSlug}/rounds/${id}`, data)
  }
  /** @param {import('@/types/context').RoundContextData} context */
  delete (context) {
    const { areaSlug, id } = context;
    return this.client.delete(`${areaSlug}/rounds/${id}`)
  }
  /** @param {import('@/types/context').RoundContextData} context */
  teamsBidders (context) {
    const { areaSlug, id, data } = context;
    return this.client.get(`${areaSlug}/rounds/${id}/bidders`, data)
  }
  /** @param {import('@/types/context').RoundContextData} context */
  createBidWindows (context) {
    const { areaSlug, id, data } = context;
    return this.client.post(`${areaSlug}/rounds/${id}/windows`, data)
  }
  /** @param {import('@/types/context').RoundContextData} context */
  reset (context) {
    const { areaSlug, id } = context;
    return this.client.post(`${areaSlug}/rounds/${id}/reset`)
  }
}
export default RoundRepository;
