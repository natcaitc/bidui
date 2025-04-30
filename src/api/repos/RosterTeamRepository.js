// @/api/repos/RosterTeamRepository.js
import apiClient from '@/api/client.js';

class RosterTeamRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  get () {
    return this.client.get('/rosterteams')
  }
  create (data) {
    return this.client.post('/rosterteams', data)
  }
  update (id, data) {
    return this.client.put(`/rosterteams/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/rosterteams/${id}`)
  }
  order (id, data) {
    return this.client.put(`/rostersteams/${id}/order`, { changes: data })
  }
}
export default RosterTeamRepository;
