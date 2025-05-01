// @/api/repos/BidRepository.js
import apiClient from '@/api/client.js';

class BidRepository {
  constructor () {
    this.client = apiClient;
  }

  get (id) {
    return this.client.get(`/bids/${id}` )
  }
  getBidSummary (bidYear) {
    return this.client.get(`/bids/summary`, { bid_year: bidYear })
  }
  getBidHistory (data) {
    return this.client.get('/bids/history', data)
  }
  create (data) {
    return this.client.post('/bids/', data)
  }
  update (id, data) {
    return this.client.put(`/bids/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/bids/${id}`)
  }
}
export default BidRepository;
