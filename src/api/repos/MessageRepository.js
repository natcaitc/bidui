// @/api/repos/MessageRepository.js
import apiClient from '@/api/client.js';

class MessageRepository {
  constructor () {
    this.client = apiClient;
  }
  get (id = null, bidYear = null, page = 1) {
    const path = '/messages' + (id ? `/${id}` : '')
    return this.client.get(path, { page, bidYear })
  }
  search (bidYear, data) {
    return this.client.post('/messages/search', { bid_year: bidYear, criteria: data })
  }
}
export default MessageRepository;
