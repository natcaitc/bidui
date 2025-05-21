// @/api/repos/FacilityRepository.js
import apiClient from '@/api/client.js';

class CrewRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').CrewContextData} context */
  get (context) {
    const { areaSlug, id, data } = context;
    const path = `/${areaSlug}/crews` + (id ? `/${id}` : '')
    return this.client.get(path, data)
  }

  /** @param {import('@/types/context').CrewContextData} context */
  create (context) {
    const { areaSlug, data } = context;
    return this.client.post(`/${areaSlug}/crews`, data)
  }

  /** @param {import('@/types/context').CrewContextData} context */
  update (context) {
    const { areaSlug, id, data } = context;
    return this.client.put(`/${areaSlug}/crews/${id}`, data)
  }

  /** @param {import('@/types/context').CrewContextData} context */
  delete (context) {
    const { areaSlug, id } = context;
    return this.client.delete(`/${areaSlug}/crews/${id}`)
  }
}
export default CrewRepository;
