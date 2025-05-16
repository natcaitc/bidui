// @/api/repos/FacilityRepository.js
import apiClient from '@/api/client.js';

class FacilityRepository {
  constructor () {
    this.client = apiClient;
  }
  get (id = null) {
    const path = '/facilities' + (id ? `/${id}` : '');
    return this.client.get(path)
  }
  create (data) {
    return this.client.post('/facilities', data)
  }
  delete (id) {
    return this.client.delete(`/facilities/${id}`)
  }

  /**
     * *** CONTEXT SET ***
     * @param {string} id
     * @param {Object} data
     */
  update (id, data) {
    return this.client.put(`/update`, data)
  }

  /**
   * Retrieves the list of employee types from the server.
   *
   * @return {Promise<Object>} A promise that resolves to the response containing employee types.
   */
  getEmployeeTypes () {
    return this.client.get(`/employee-types`)
  }
}
export default FacilityRepository;

/** OLD FILE */
/**
 * Sends a POST request to activate a specific resource.
 * !! Assumes basepath is already set (e.g., /api/facilityId/employee-types)
 *
 */
// activate()
// {
//   return this.client.post(`/activate`)
// }
