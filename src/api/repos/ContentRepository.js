// @/api/repos/ContentRepository.js
import apiClient from '@/api/client.js';

class ContentRepository {
  constructor () {
    this.client = apiClient;
  }
  get () {
    return this.client.get(`/contents`)
  }
  create (data) {
    return this.client.post(`/contents/`, data)
  }
  update (id, data) {
    return this.client.put(`/contents/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/contents/${id}`)
  }
}
export default ContentRepository;
