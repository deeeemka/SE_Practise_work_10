import type { Room } from './types';

export interface RoomFilterCriteria {
  attendees: number | null;
  requiredEquipment: string[];
}

export function filterRooms(rooms: Room[], criteria: RoomFilterCriteria): Room[] {
  return rooms.filter((room) => {
    if (room.blocked) return false;
    if (criteria.attendees !== null && room.capacity < criteria.attendees) return false;
    return criteria.requiredEquipment.every((item) => room.equipment.includes(item));
  });
}

export function collectEquipment(rooms: Room[]): string[] {
  return Array.from(new Set(rooms.flatMap((room) => room.equipment))).sort();
}
