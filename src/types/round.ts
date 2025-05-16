export interface Round {
  id: number
  year: number
  roster_id: number
  number: number
  status: 'pending' | 'active' | 'ended'
  holidays_allowed: number
  require_consecutive_days: boolean | 0 | 1
  crew_limit: number
  use_bid_windows: boolean | 0 | 1
  close_bid_windows: boolean | 0 | 1
  teams_bid_concurrently: boolean | 0 | 1
  bid_limit: number
  bid_limit_unit: string
  leave_type: 'accrued' | 'unpaid' | string
  accrual_exhausted_notified: boolean | 0 | 1
  bidders_created: boolean | 0 | 1
  name: string
  type: 'line' | 'leave' | string
}
