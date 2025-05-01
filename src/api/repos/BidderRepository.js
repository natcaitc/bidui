// @/api/repos/BidderRepository.js
import apiClient from '@/api/client.js';

class BidderRepository {
  constructor () {
    this.client = apiClient;
  }
  get (bidYear) {
    return this.client.get('/bidders', null, { bid_year: bidYear })
  }
  // getMemberBidders (bidYear, memberID) {
  //   return this.client.get('getMemberBidders', `member/${memberID}`, { bid_year: bidYear })
  // }
  // fetchEligibleBidders (bidderID, skipToEnd) {
  //   return this.client.post({ skipToEnd }, 'fetchEligibleBidders', `eligible/${bidderID}`)
  // }
  create (data) {
    return this.client.post('/bidders', data)
  }
  update (id, data) {
    return this.client.put(`/bidders/${id}`, data)
  }
  delete (id) {
    return this.client.delete(`/bidders/${id}`)
  }
}
export default BidderRepository;
