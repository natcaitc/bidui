// @/api/repos/MemberRepository.js
import apiClient from '@/api/client.js';

class MemberRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  get (id = null, areaSlug = null) {
    if (id) {
      return this.client.get(`/members/${id}`)
    } else if (areaSlug) {
      return this.client.get('/members', { 'area-slug': areaSlug })
    } else {
      return this.client.get('/members')
    }
  }
  create (data) {
    return this.client.post('/members', data)
  }
  update (id, data) {
    return this.client.put(`/members/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/members/${id}`)
  }
  getSchedule (id) {
    return this.client.get(`/members/${id}/schedule`)
  }
  import (data) {
    return this.client.post('/members/import', { ...data })
  }
  search (criteria) {
    return this.client.post('/members/search', criteria)
  }
  getLeave (id) {
    return this.client.get(`/members/${id}`)
  }
}
export default MemberRepository;
