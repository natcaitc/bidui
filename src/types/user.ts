// @/src/types/user.ts

export type RoleId = 'guest' | 'controller' | 'bidaid' | 'arearep' | 'admin' | 'super'

export interface User {
  id: number
  email: string
  member_id: number
  role_id: RoleId
  full_name: string
  fname: string
  lname: string
}
