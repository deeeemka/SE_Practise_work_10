import type { AvailabilityResult, Booking, Room } from './types';

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION_MINUTES = 120;

export interface CandidateWindow {
  start: number;
  end: number;
}

export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function labelToMinutes(label: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(label.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function durationMinutes(window: CandidateWindow): number {
  return window.end - window.start;
}

export function overlaps(a: Booking, w: CandidateWindow): boolean {
  return a.start < w.end && w.start < a.end;
}

export function checkAvailability(
  room: Room,
  candidate: CandidateWindow,
  nowMinutes: number
): AvailabilityResult {
  const reasons: string[] = [];

  if (room.blocked) {
    reasons.push(
      `This room is currently blocked${room.blockReason ? `: ${room.blockReason}` : ''}. No booking requests can be accepted while the block is active.`
    );
    return { status: 'unavailable', reasons };
  }

  if (!Number.isInteger(candidate.start) || !Number.isInteger(candidate.end)) {
    reasons.push('Start and end times must be whole minutes.');
  }

  if (candidate.start < 0 || candidate.start >= MINUTES_PER_DAY) {
    reasons.push(`Start time must be between 00:00 and 23:59 (0–1439 minutes).`);
  }

  if (candidate.end < 1 || candidate.end > MINUTES_PER_DAY) {
    reasons.push('End time must be between 00:01 and 24:00 (1–1440 minutes).');
  }

  if (candidate.start >= candidate.end) {
    reasons.push('Start time must be earlier than end time.');
  }

  if (candidate.start <= nowMinutes) {
    reasons.push(
      `Start time must be strictly after the current time (${minutesToLabel(nowMinutes)}).`
    );
  }

  const duration = durationMinutes(candidate);
  if (duration > MAX_DURATION_MINUTES) {
    reasons.push(
      `Duration is ${duration} minutes. The maximum allowed is ${MAX_DURATION_MINUTES} minutes (exactly 120 is permitted).`
    );
  }

  if (duration <= 0) {
    reasons.push('Duration must be greater than zero.');
  }

  const conflicting = room.bookings.filter((b) => overlaps(b, candidate));
  if (conflicting.length > 0) {
    const first = conflicting[0];
    reasons.push(
      `Overlaps an existing booking: "${first.title}" (${minutesToLabel(first.start)}–${minutesToLabel(first.end)}). Intervals that only touch at an endpoint are allowed, but this window overlaps.`
    );
  }

  if (reasons.length > 0) {
    return { status: 'unavailable', reasons };
  }

  return {
    status: 'available',
    reasons: [
      `Room is available from ${minutesToLabel(candidate.start)} to ${minutesToLabel(candidate.end)} (${duration} min). No existing bookings overlap and the room is not blocked.`,
    ],
  };
}
