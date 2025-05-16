// @/api/repos/AreaRepository.js
import apiClient from '@/api/client.js';

class AreaRepository {
  constructor () {
    this.client = apiClient;
  }

  /** @param {import('@/types/context').AreaContextData} context */
  get (context) {
    const path = context?.id ? `/${context.id}` : ''
    return this.client.get(`/areas/${path}`)
  }

  /** @param {import('@/types/context').AreaContextData} context */
  create (context){
    return this.client.post('/areas', context.data)
  }

  /** @param {import('@/types/context').AreaContextData} context */
  update (context) {
    const { id, data } = context;
    return this.client.put(`/areas/${id}`, data)
  }

  /** @param {import('@/types/context').AreaContextData} context */
  delete (context) {
    return this.client.delete(`/areas/${context.id}`)
  }

  /** @param {import('@/types/context').AreaContextData} context */
  order (context) {
    console.log('[AreaRepository.order] - ', context)
    return this.client.put(`/areas/order`, context.data)
  }

  /** @param {import('@/types/context').AreaContextData} context */
  fetchStats (context) { /** TODO: UPDATED ROUTE - NEED TO UPDATE BACKEND */
    const { id, refresh } = context;
    return this.client.post(`/areas/${id}/fetchStats`, { recalculate: refresh })
  }

  /** @param {import('@/types/context').AreaContextData} context */
  resetArea (context) {
    return this.client.post(`/areas/${context.id}/reset`)
  }
}
export default AreaRepository
