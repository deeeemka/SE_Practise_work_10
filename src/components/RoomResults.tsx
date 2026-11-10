import { Check, MapPin, Search, Users } from 'lucide-react';
import type { Room } from '@/types';

interface RoomResultsProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
  onReset: () => void;
}

export default function RoomResults({ rooms, selectedRoomId, onSelect, onReset }: RoomResultsProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">No rooms match your criteria</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
          Try a smaller group size or remove an equipment requirement to see more rooms.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rooms.map((room) => {
        const selected = room.id === selectedRoomId;
        return (
          <li key={room.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(room.id)}
              className={`group flex h-full w-full flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                selected ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{room.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {room.building}
                  </p>
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    selected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selected ? <Check className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                  {room.capacity}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {room.equipment.map((item) => (
                  <span key={item} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
