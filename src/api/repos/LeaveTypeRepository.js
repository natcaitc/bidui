// @/api/repos/LeaveTypeRepository.js
import apiClient from '@/api/client.js';

class LeaveTypeRepository {
  constructor () {
    this.client = apiClient;
  }
  get () {
    return this.client.get('/leavetypes')
  }
  create (data) {
    return this.client.post('/leavetypes', data)
  }
  update (id, data) {
    return this.client.put(`/leavetypes/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/leavetypes/${id}`)
  }
}
export default LeaveTypeRepository;
