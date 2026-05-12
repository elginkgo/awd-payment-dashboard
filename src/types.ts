export interface Farmer {
  id: number;
  parcel_id: number;
  grouping: string;
  nzc_field_id: string;
  farmer_name: string;
  activity_area: number;
  status: string;
  planting: number;
  dry_1: number;
  wet_1: number;
  harvest: number;
  updated_at: string;
}
