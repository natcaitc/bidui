// @/api/repos/AuthRepository.js
import apiClient from '@/api/client.js';

class AuthRepository {
  constructor () {
    this.client = apiClient;
  }

  getUser (userId = null, withMember = false) {
    const path = '/auth/get-user/' + (userId ? `/${userId}` : '');
    return this.client.get(path, { with_member: withMember })
  }

  getScope (facilityId, userId = null) {
    console.log(userId, facilityId)
    const path = userId ? `/auth/get-scope/${userId}` : '/auth/get-scope';
    return this.client.get(path, { facility_id: facilityId })
  }

  getActivity (userId, page = 1) {
    return this.client.get(`/auth/activity/${userId}`, { page });
  }
}
export default AuthRepository
