export interface AreaContextData {
  // ID of the area - use caution - route/model binding uses SLUG
  id?: number
  // Slug of the area !! Make sure not ID !!
  areaSlug: string
  // Data for create/update operations
  data: Record<string, unknown>
}

export interface RosterContextData {
  // ID of the Roster
  id?: number
  // Data for create/update operations
  data: Record<string, unknown>
  // Slug of the parent area
  areaSlug: string
  // Retrieve rounds for the specified year :: Defaults to current year
  bidYear?: number
}

export interface RosterTeamContextData {
  // ID of the RosterTeam
  id?: number
  // Data for create/update operations
  data: Record<string, unknown>
  // Slug of the parent area
  areaSlug: string
  // ID of the parent Roster
  rosterId: number
  // Retrieve rounds for the specified year :: Defaults to current year
  bidYear?: number
}

export interface RoundContextData {
  // Optional ID for get/update/delete operations
  id?: number
  // Data for create/update operations
  data: Record<string, unknown>
  // Slug of area the round(s) belong to
  areaSlug: string
  // Retrieve rounds for the specified year :: Defaults to current year
  bidYear?: number
}

export interface MemberContextData {
  // Optional ID for get/update/delete operations
  id?: number
  // Data for create/update operations
  data: Record<string, unknown>
  // Slug of area the round(s) belong to
  areaSlug: string
}
