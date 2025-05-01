// @/api/repos/ContentRepository.js
import apiClient from '@/api/client.js';

class ContentRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.facilityId = facilityId;
  }
  get () {
    return this.client.get(`${this.facilityId}/contents`)
  }
  create (data) {
    return this.client.post(`${this.facilityId}/contents/`, data)
  }
  update (id, data) {
    return this.client.put(`${this.facilityId}/contents/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`${this.facilityId}/contents/${id}`)
  }
}
export default ContentRepository;
