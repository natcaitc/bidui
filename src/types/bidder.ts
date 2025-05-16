export interface Bidder {
  id: number
  member_id: number
  employee_type_id: number
  fname: string
  lname: string
  full_name: string
  name_lf: string
  init: string
  up_to_bid: number
  bid: number
  skipped: number
  start: string // ISO datetime string
  end: string | null
  notified: number
  balance_accrued: number
  balance_accumulated: number
}
