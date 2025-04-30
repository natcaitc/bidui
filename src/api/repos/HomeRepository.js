// @/api/repos/HomeRepository.js
import apiClient from '@/api/client.js';

class HomeRepository {
  constructor () {
    this.client = apiClient;
  }
  contact (email) {
    return this.client.post('/contact', { email })
  }
}
export default HomeRepository;
