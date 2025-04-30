// @/api/repos/FacilityRepository.js
import apiClient from '@/api/client.js';

class CrewRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  get () {
    return this.client.get('/crews')
  }
  create (data) {
    return this.client.post('/crews', data)
  }
  update (id, data) {
    return this.client.put(`/crews/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/crews/${id}`)
  }
}
export default CrewRepository;
