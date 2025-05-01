// @/api/repos/RosterRepository.js
import apiClient from '@/api/client.js';

class RosterRepository {
  constructor () {
    this.client = apiClient;
  }

  get (id = null, bidYear = null) {
    const path = '/rosters' + (id ? `/${id}` : '')
    return this.client.get(path, { bidYear })
  }
  create (data) {
    return this.client.post('/rosters', data)
  }
  update (id, data) {
    return this.client.put(`/rosters/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/rosters/${id}`)
  }
  members (id) {
    return this.client.get(`/rosters/${id}/members`)
  }
  order (id, data) {
    return this.client.put(`/rosters/${id}/order`, { changes: data } )
  }
}
export default RosterRepository;
