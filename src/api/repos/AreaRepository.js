// @/api/repos/AreaRepository.js
import apiClient from '@/api/client.js';

class AreaRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  fetchAreas () {
    return this.client.get('/areas');
  }

  fetchStats (areaId, refresh = false) { /** TODO: UPDATED ROUTE - NEED TO UPDATE BACKEND */
    return this.client.post(`/areas/${areaId}/fetchStats`, { recalculate: refresh })
  }

  createArea (payload){
    return this.client.post('/areas', payload)
  }

  updateArea (areaId, payload) {
    return this.client.put(`/areas/${areaId}`, payload)
  }

  deleteArea (areaId) {
    return this.client.delete(`/areas/${areaId}`)
  }

  resetArea (areaId) {
    return this.client.post(`/areas/${areaId}/reset`)
  }
}
export default AreaRepository
