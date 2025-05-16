// @/api/repos/MemberRepository.js
import apiClient from '@/api/client.js';

class MemberRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').MemberContextData} context */
  get (context) {
    const { id, areaSlug } = context;
    if (id) {
      return this.client.get(`/members/${id}`)
    } else if (areaSlug) {
      return this.client.get('/members', { 'area-slug': areaSlug })
    } else {
      return this.client.get('/members')
    }
  }

  /** @param {import('@/types/context').MemberContextData} context */
  create (context) {
    return this.client.post('/members', context.data)
  }

  /** @param {import('@/types/context').MemberContextData} context */
  update (context) {
    const { id, data } = context;
    return this.client.put(`/members/${id}`, data)
  }

  /** @param {import('@/types/context').MemberContextData} context */
  delete (context) {
    return this.client.delete(`/members/${context.id}`)
  }

  /** @param {import('@/types/context').MemberContextData} context */
  getSchedule (context) {
    return this.client.get(`/members/${context.id}/schedule`)
  }

  /** @param {import('@/types/context').MemberContextData} context */
  import (context) {
    const { areaSlug, data } = context;
    return this.client.post(`${areaSlug}/members/import`, { ...data })
  }

  /** @param {import('@/types/context').MemberContextData} context */
  search (context) {
    const { areaSlug, data } = context;
    return this.client.post(`${areaSlug}/members/search`, data)
  }

  /** @param {import('@/types/context').MemberContextData} context */
  getLeave (context) {
    return this.client.get(`/members/${context.id}`)
  }
}
export default MemberRepository;
