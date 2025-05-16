export interface Member {
  id: number
  name_lf: string
  employee_type_id: number
  init?: string
  BU_date?: string
  NATCA_date?: string
  EOD_date?: string
  SCD_date?: string
  type_name?: string // injected in loadRoster
}
