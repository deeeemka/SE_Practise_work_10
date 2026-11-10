// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { checkAvailability } from './availability';
import { filterRooms } from './roomFilters';
import type { Room } from './types';

afterEach(() => {
  cleanup();
});

function canBook(
  start: number,
  end: number,
  nowMinutes: number,
  blocked: boolean,
  bookedRanges: number[][]
): boolean {
  const room: Room = {
    id: 'test-room',
    name: 'Test Room',
    building: 'Test Building',
    capacity: 10,
    equipment: [],
    blocked,
    blockReason: blocked ? 'Test block' : undefined,
    bookings: bookedRanges.map(([s, e], i) => ({
      id: `t${i}`,
      title: `Booking ${i}`,
      organizer: 'Test',
      start: s,
      end: e,
    })),
  };
  return checkAvailability(room, { start, end }, nowMinutes).status === 'available';
}

function mockRoom(overrides: Partial<Room> & Pick<Room, 'id' | 'capacity' | 'equipment' | 'blocked'>): Room {
  return { name: `Room ${overrides.id}`, building: 'Test', bookings: [], ...overrides };
}

describe('AC1-AC5: Regression & Boundary Tests', () => {
  const now = 540; // 9:00 AM
  const existingBookings = [[600, 660]]; // 10:00 AM - 11:00 AM

  it('Test 1: Allows exactly 120 minutes (Boundary)', () => {
    // Request: 12:00 PM to 2:00 PM (720 to 840)
    expect(canBook(720, 840, now, false, existingBookings)).toBe(true);
  });

  it('Test 2: Rejects 121 minutes (Boundary)', () => {
    // Request: 12:00 PM to 2:01 PM (720 to 841)
    expect(canBook(720, 841, now, false, existingBookings)).toBe(false);
  });

  it('Test 3: Allows touching intervals (Boundary)', () => {
    // Request: 11:00 AM to 12:00 PM (660 to 720) - Touches existing end time
    expect(canBook(660, 720, now, false, existingBookings)).toBe(true);
  });

  it('Test 4: Rejects overlapping intervals (Boundary)', () => {
    // Request: 10:30 AM to 11:30 AM (630 to 690) - Overlaps existing
    expect(canBook(630, 690, now, false, existingBookings)).toBe(false);
  });

  it('Test 5: Rejects if room is blocked (AC5)', () => {
    expect(canBook(720, 840, now, true, existingBookings)).toBe(false);
  });
});

describe('F1-F3: Filtering Logic Tests', () => {
  const mockRooms: Room[] = [
    mockRoom({ id: 'a', capacity: 30, equipment: ['Projector'], blocked: false }),
    mockRoom({ id: 'b', capacity: 29, equipment: ['Projector'], blocked: false }),
    mockRoom({ id: 'c', capacity: 50, equipment: [], blocked: true }),
  ];

  it('Test 6: Includes room with exact capacity (Boundary)', () => {
    // Requested capacity: 30
    const result = filterRooms(mockRooms, { attendees: 30, requiredEquipment: [] });
    expect(result.some((r) => r.id === 'a')).toBe(true);
  });

  it('Test 7: Excludes room with insufficient capacity (Boundary)', () => {
    // Requested capacity: 30
    const result = filterRooms(mockRooms, { attendees: 30, requiredEquipment: [] });
    expect(result.some((r) => r.id === 'b')).toBe(false); // Room B has 29
  });

  it('Test 8: Filters correctly by equipment (F2)', () => {
    const result = filterRooms(mockRooms, { attendees: 10, requiredEquipment: ['Projector'] });
    expect(result.length).toBe(2); // Rooms A and B
  });

  it('Test 9: Excludes blocked rooms regardless of capacity/equipment (F3)', () => {
    const result = filterRooms(mockRooms, { attendees: 10, requiredEquipment: [] });
    expect(result.some((r) => r.id === 'c')).toBe(false);
  });
});

describe('F4-F5: UI & Integration Tests', () => {
  it('Test 10: Renders empty state when no rooms match (F4)', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Number of attendees/i), {
      target: { value: '5000' },
    });
    expect(screen.getByText(/No rooms match/i)).toBeDefined();
  });

  it('Test 11: Unsuccessful availability check updates UI', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Engineering 204/i }));
    fireEvent.change(screen.getByLabelText(/Start time/i), {
      target: { value: '11:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check availability/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/Unavailable/);
  });
});


describe('Targeted Regression: Risk R-04 Boundary Checks', () => {
  it('Test 12: Rejects invalid or negative duration inputs safely', () => {
    // Requesting start time 09:00 AM with negative duration (-30 mins)
    const invalidWindow = { start: 540, end: 510 };
    const room: Room = {
      id: 'r1',
      name: 'Room 1',
      building: 'Main',
      capacity: 10,
      equipment: [],
      blocked: false,
      bookings: [],
    };
    const result = checkAvailability(room, invalidWindow, 500);
    
    expect(result.status).toBe('unavailable');
    expect(result.reasons).toContain('Start time must be earlier than end time.');
  });
});
