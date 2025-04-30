// @/api/repos/LineGroupRepository.js
import apiClient from '@/api/client.js';

class LineGroupRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  get (bidYear, withInactive = false) {
    return this.client.post('/linegroups', { bid_year: bidYear, withInactive })
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
