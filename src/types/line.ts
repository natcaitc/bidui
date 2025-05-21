export interface LineDetail {
  id: number
  start: string
  su: string | null
  su_length: number | null
  mo: string | null
  mo_length: number | null
  tu: string | null
  tu_length: number | null
  we: string | null
  we_length: number | null
  th: string | null
  th_length: number | null
  fr: string | null
  fr_length: number | null
  sa: string | null
  sa_length: number | null
}

export interface Line {
  id: number
  name: string
  line: number
  employee_type_id: number
  notes: string | null
  bgcolor: string | null
  hours: number
  repeat: string
  crew_id: number
  crew_name: string
  bid_id: number
  bid_init: string
  bid_member_id: number
  details: LineDetail[]
}
