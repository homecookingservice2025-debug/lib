import { Type } from "@google/genai";

export interface Staff {
  id: string;
  name: string;
  father_name: string;
  address: string;
  state: string;
  email: string;
  contact: string;
  password?: string;
  blood_group: string;
  emergency_contact: string;
  role: string;
}

export interface Student {
  id: string;
  name: string;
  father_name: string;
  address: string;
  state: string;
  email: string;
  contact: string;
  blood_group: string;
  emergency_contact: string;
  created_at: string;
  sub_status?: string;
  sub_expiry?: string;
  current_seat?: string;
  last_check_in?: string;
}

export interface Seat {
  id: string;
  zone_id: number;
  zone_name: string;
  section: string;
  seat_number: number;
  status: 'available' | 'occupied' | 'reserved';
  current_student_id?: string;
}

export interface Zone {
  id: number;
  name: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
}

export interface OccupancyStats {
  total: number;
  occupied: number;
}
