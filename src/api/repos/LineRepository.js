// @/api/repos/LineRepository.js
import apiClient from '@/api/client.js';

class LineRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').LineContextData} context */
  get (context) {
    const { areaSlug, id } = context;
    const path = `${areaSlug}/lines` + (id ? `/${id}` : '');
    return this.client.get(path)
  }
  create (context) {
    const { areaSlug, data } = context;
    return this.client.post(`${areaSlug}/lines`, data)
  }
  update (context) {
    const { areaSlug, id, data } = context;
    return this.client.put(`${areaSlug}/lines/${id}`, data)
  }
  delete (context) {
    const { areaSlug, id } = context;
    return this.client.delete(`${areaSlug}/lines/${id}`)
  }
  order (context) {
    const { areaSlug, data } = context;
    return this.client.put(`${areaSlug}/lines/order`, { changes: data })
  }
  duplicate (context) {
    const { areaSlug, id } = context;
    return this.client.post(`${areaSlug}/lines/${id}/duplicate`)
  }
}
export default LineRepository;
