// @/api/repos/FacilityRepository.js
import apiClient from '@/api/client.js';

class FacilityRepository {
  constructor () {
    this.client = apiClient;
  }
  get (id = null) {
    const path = '/facilities' + (id ? `/${id}` : '');
    return this.client.get(path)
  }
  create (data) {
    return this.client.post('/facilities', data)
  }
  update (id, data) {
    return this.client.put(`/facilities/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/facilities/${id}`)
  }
  getEmployeeTypes (id) {
    return this.client.get(`/facilities/${id}/employee-types`)
  }
  activate (id) {
    return this.client.post(`/facilities/${id}/activate`)
  }
}
export default FacilityRepository;
