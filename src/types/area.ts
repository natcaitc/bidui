// @/src/types/area.ts

export interface Area {
  id: number;
  facility_id: string;
  tag: string;
  name: string;
  use_bid_aid: boolean;
  subtract_holiday_leave: boolean;
  slack_webhook: string | null;
  slack_channel: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  test_mode: boolean;
  require_login: boolean;
  slug: string;
  grace_hours: number;
  accrual_hours_limit: number;
  accrual_slot_factor: number;
  order: number;
  use_retiree_accrual: boolean;
  exceeded_preapproved: boolean;
  discord_channel_id: string | null;
}
