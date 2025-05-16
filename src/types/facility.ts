// @/src/types/facility.ts

export interface Facility {
  id: string
  name: string
  bid_year: number
  active: boolean
  test_mode: number
  test_mail?: string | null
  test_nexmo?: string | null
  test_slack?: string | null
  test_slack_channel?: string | null
  hide_all_content: number
  bid_lock_time: number
  bid_hours?: string | null
  timezone: string
  year: {
    firstDay: string
    lastDay: string
    payperiods: number
  }
  allow_text: number
  auto_open_close: number
  last_bue_update: string
  server_ip: string
  today?: string | null
}
