import { Line } from './line'

export interface LineGroup {
  id: number
  year: number
  name: string
  start_day: string // ISO date string, can change to `Date` if parsed
  end_day: string // ISO date string, can change to `Date` if parsed
  active: number | boolean // 1/0 or true/false depending on backend
  lines: Line[] // assumes you have a Line type defined elsewhere
}
