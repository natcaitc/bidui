// @/api/repos/LineGroupRepository.js
import apiClient from '@/api/client.js';

class LineGroupRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').LineGroupContextData} context */
  get (context) {
    const { areaSlug, id, bidYear } = context;
    const path = `${areaSlug}/linegroups` + (id ? `/${id}` : '')
    return this.client.get(path, { bid_year: bidYear })
  }
  create (data) {
    return this.client.post('/linegroups', data)
  }
  update (id, data) {
    return this.client.put(`/linegroups/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/linegroups/${id}`)
  }
  duplicate (id) {
    return this.client.post(`/linegroups/${id}/duplicate`)
  }
  import (id, importId) {
    return this.client.post(`/linegroups/${id}`, { idToImport: importId })
  }
}
export default LineGroupRepository;
