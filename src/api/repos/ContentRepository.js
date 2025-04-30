// @/api/repos/ContentRepository.js
import apiClient from '@/api/client.js';

class ContentRepository {
  constructor (facilityId) {
    this.client = apiClient;
    this.client.setBaseURL(facilityId);
  }
  get () {
    return this.client.get('/content')
  }
  create (data) {
    return this.client.post('/content/', data)
  }
  update (id, data) {
    return this.client.put(`/content/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/content/${id}`)
  }
}
export default ContentRepository;
