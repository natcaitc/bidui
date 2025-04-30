// @/api/repos/LineRepository.js
import apiClient from '@/api/client.js';

class LineRepository {
  constructor (facilityId, areaSlug) {
    this.client = apiClient;
    this.client.setBaseURL(`${facilityId}/${areaSlug}`);
  }
  get (groupId = null) {
    const path = '/lines' + (groupId ? `/${groupId}` : '');
    return this.client.get(path)
  }
  create (data) {
    return this.client.post('/lines', data)
  }
  update (id, data) {
    return this.client.put(`/lines/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/lines/${id}`)
  }
  order (data) {
    return this.client.put('/lines/order', { changes: data })
  }
  duplicate (id, newLineNumber) {
    return this.client.post(`/lines/${id}/duplicate`, { newLineNumber })
  }
}
export default LineRepository;
