// @/api/repos/LeaveRepository.js
import apiClient from '@/api/client.js';

class LeaveRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  getCalendar (bidYear = null, start = null, end = null) {
    return this.client.get('/leave/calendar', { bid_year: bidYear, start, end })
  }
  getSlots (bidYear, typeID = null, start = null, end = null) {
    return this.client.get('/leave/slots', { bid_year: bidYear, type_id: typeID, start, end })
  }
  saveSlots (data) {
    return this.client.post('/leave/slots', data)
  }
  get () {
    return this.client.get('/leave')
  }
  create (data) {
    return this.client.post('/leave', data)
  }
  update (id, data) {
    return this.client.put(`/leave/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/leave/${id}`)
  }
}
export default LeaveRepository;
