// @/api/repos/AuthRepository.js
import apiClient from '@/api/client.js';

class AuthRepository {
  constructor () {
    this.client = apiClient;
    this.client.setBaseURL('users')
  }

  getUser (userId = null, withMember = false) {
    const path = (userId ? `/${userId}` : '');
    return this.client.get(path, { with_member: withMember })
  }

  getScope (userId, facilityId) {
    return this.client.get(`${userId}/get-scope`, { facility_id: facilityId })
  }

  getActivity (userId, page = 1) {
    return this.client.get(`${userId}/getActivity`, { page });
  }
}
export default AuthRepository
