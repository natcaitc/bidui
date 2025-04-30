// @/api/repos/RoundRepository.js
import apiClient from '@/api/client.js';

class RoundRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  get (bidYear) {
    return this.client.get('/rounds', { bid_year: bidYear })
  }
  create (data) {
    return this.client.post('/rounds', data)
  }
  update (id, data) {
    return this.client.put(`/rounds/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/rounds/${id}`)
  }
  createBidWindows (id, data) {
    return this.client.post(`/rounds/${id}/windows`, data)
  }
  reset (id) {
    return this.client.post(`/rounds/${id}/reset`)
  }
}
export default RoundRepository;
