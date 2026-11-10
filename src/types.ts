export interface Booking {
  id: string;
  title: string;
  organizer: string;
  start: number; // minutes after midnight, 0 <= start < end <= 1440
  end: number; // minutes after midnight
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  blockReason?: string;
  bookings: Booking[];
}

export type AvailabilityStatus = 'available' | 'unavailable' | 'unknown';

export interface AvailabilityResult {
  status: AvailabilityStatus;
  reasons: string[];
}
