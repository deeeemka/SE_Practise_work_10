import { useMemo, useState } from 'react';
import {
  CalendarCheck,
  CalendarX,
  Clock,
  DoorClosed,
  Info,
  MapPin,
  Users,
  RotateCcw,
} from 'lucide-react';
import { ROOMS, FICTIONAL_NOW_MINUTES } from './data';
import {
  MAX_DURATION_MINUTES,
  MINUTES_PER_DAY,
  checkAvailability,
  durationMinutes,
  labelToMinutes,
  minutesToLabel,
  type CandidateWindow,
} from './availability';
import { collectEquipment, filterRooms, type RoomFilterCriteria } from './roomFilters';
import RoomFilters from '@/components/RoomFilters';
import RoomResults from '@/components/RoomResults';
import type { Room } from './types';

const EQUIPMENT_OPTIONS = collectEquipment(ROOMS);

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function minutesToTimeInput(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function StatusBanner({
  status,
  reasons,
}: {
  status: 'available' | 'unavailable' | 'unknown';
  reasons: string[];
}) {
  if (status === 'unknown') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <p className="text-sm leading-relaxed">
            Enter a start time and a duration, then check availability. The
            result will show clearly whether the room is available.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'available') {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
      >
        <div className="flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-emerald-600" />
          <h2 className="text-lg font-semibold text-emerald-900">
            Available
          </h2>
        </div>
        <ul className="mt-3 space-y-1.5">
          {reasons.map((r, i) => (
            <li
              key={i}
              className="text-sm leading-relaxed text-emerald-800"
            >
              {r}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50 p-5"
    >
      <div className="flex items-center gap-2.5">
        <CalendarX className="h-6 w-6 text-rose-600" />
        <h2 className="text-lg font-semibold text-rose-900">Unavailable</h2>
      </div>
      <ul className="mt-3 space-y-1.5">
        {reasons.map((r, i) => (
          <li key={i} className="text-sm leading-relaxed text-rose-800">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BookingChip({ start, end, title }: { start: number; end: number; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">{title}</p>
      </div>
      <div className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
        {minutesToLabel(start)}–{minutesToLabel(end)}
      </div>
    </div>
  );
}

function Timeline({
  room,
  candidate,
  nowMinutes,
}: {
  room: Room;
  candidate: CandidateWindow | null;
  nowMinutes: number;
}) {
  const hours = useMemo(
    () => Array.from({ length: 25 }, (_, i) => i * 60),
    []
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Clock className="h-4 w-4 text-slate-500" />
        Today's schedule (00:00 – 24:00)
      </div>

      <div className="relative h-16 overflow-hidden rounded-xl bg-slate-50">
        {/* hour gridlines */}
        {hours.map((m) => (
          <div
            key={m}
            className="absolute top-0 bottom-0 w-px bg-slate-200"
            style={{ left: `${(m / MINUTES_PER_DAY) * 100}%` }}
          />
        ))}

        {/* now marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
          style={{ left: `${(nowMinutes / MINUTES_PER_DAY) * 100}%` }}
          title={`Now ${minutesToLabel(nowMinutes)}`}
        />

        {/* existing bookings */}
        {room.bookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-2 bottom-2 rounded-md bg-slate-300/80 px-1.5 flex items-center overflow-hidden"
            style={{
              left: `${(b.start / MINUTES_PER_DAY) * 100}%`,
              width: `${((b.end - b.start) / MINUTES_PER_DAY) * 100}%`,
            }}
            title={`${b.title} ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
          >
            <span className="truncate text-[10px] font-medium text-slate-700">
              {b.title}
            </span>
          </div>
        ))}

        {/* candidate window */}
        {candidate && (
          <div
            className="absolute top-2 bottom-2 rounded-md border-2 border-dashed border-sky-500 bg-sky-400/25 flex items-center justify-center"
            style={{
              left: `${(candidate.start / MINUTES_PER_DAY) * 100}%`,
              width: `${((candidate.end - candidate.start) / MINUTES_PER_DAY) * 100}%`,
            }}
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-400">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Existing
          booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border-2 border-dashed border-sky-500 bg-sky-400/25" />
          Your request
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-0.5 bg-amber-400" /> Now
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const nowMinutes = FICTIONAL_NOW_MINUTES;

  // Default start: 10 minutes after now, snapped so the UI shows a valid-ish default.
  const defaultStart = Math.min(nowMinutes + 30, MINUTES_PER_DAY - 15);

  const [attendees, setAttendees] = useState<number | null>(1);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [startTime, setStartTime] = useState(minutesToTimeInput(defaultStart));
  const [duration, setDuration] = useState<number>(30);

  const [result, setResult] = useState<
    ReturnType<typeof checkAvailability> | null
  >(null);

  const filteredRooms = useMemo(
    () => filterRooms(ROOMS, { attendees, requiredEquipment }),
    [attendees, requiredEquipment]
  );
  const room = filteredRooms.find((r) => r.id === selectedRoomId) ?? null;

  const candidate = useMemo<CandidateWindow | null>(() => {
    const start = labelToMinutes(startTime);
    if (start === null) return null;
    const end = start + duration;
    return { start, end };
  }, [startTime, duration]);

  const candidateForTimeline =
    result && candidate ? candidate : null;

  function updateFilters(next: RoomFilterCriteria) {
    setAttendees(next.attendees);
    setRequiredEquipment(next.requiredEquipment);
    const stillVisible = filterRooms(ROOMS, next).some((r) => r.id === selectedRoomId);
    if (!stillVisible) {
      setSelectedRoomId(null);
      setResult(null);
    }
  }

  function handleSelectRoom(id: string) {
    setSelectedRoomId(id);
    setResult(null);
  }

  function handleCheck() {
    if (!room) return;
    const start = labelToMinutes(startTime);
    if (start === null) {
      setResult({
        status: 'unavailable',
        reasons: ['Start time is not a valid HH:MM time.'],
      });
      return;
    }
    const window: CandidateWindow = { start, end: start + duration };
    setResult(checkAvailability(room, window, nowMinutes));
  }

  function handleReset() {
    setAttendees(1);
    setRequiredEquipment([]);
    setSelectedRoomId(null);
    setStartTime(minutesToTimeInput(defaultStart));
    setDuration(30);
    setResult(null);
  }

  const durationTooLong = duration > MAX_DURATION_MINUTES;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
            <DoorClosed className="h-4 w-4" />
            Smart Campus
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Room Availability Checker
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Filter the room catalog, pick a room, and check whether it is free
            for a requested time window. This tool checks availability only — it
            does not create or confirm bookings.
          </p>
        </header>

        {/* Filters and catalog */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Matching rooms ({filteredRooms.length})
            </h2>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>

          <RoomFilters
            attendees={attendees}
            equipmentOptions={EQUIPMENT_OPTIONS}
            requiredEquipment={requiredEquipment}
            onAttendeesChange={(value) =>
              updateFilters({ attendees: value, requiredEquipment })
            }
            onToggleEquipment={(item) =>
              updateFilters({
                attendees,
                requiredEquipment: requiredEquipment.includes(item)
                  ? requiredEquipment.filter((e) => e !== item)
                  : [...requiredEquipment, item],
              })
            }
          />

          <div className="mt-5">
            <RoomResults
              rooms={filteredRooms}
              selectedRoomId={room?.id ?? null}
              onSelect={handleSelectRoom}
              onReset={handleReset}
            />
          </div>
        </section>

        {room ? (
          <>
            {/* Selected room */}
            <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                {room.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {room.building}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Seats {room.capacity}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Now {minutesToLabel(nowMinutes)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {room.equipment.map((item) => (
                  <span key={item} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            {/* Request form */}
            <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">
                Request a time
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="start-time"
                    className="mb-1.5 block text-xs font-medium text-slate-500"
                  >
                    Start time (HH:MM, 24h)
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setResult(null);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Must be after {minutesToLabel(nowMinutes)} (now).
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="mb-1.5 block text-xs font-medium text-slate-500"
                  >
                    Duration (minutes, max {MAX_DURATION_MINUTES})
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min={1}
                    max={MAX_DURATION_MINUTES}
                    step={1}
                    value={duration}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDuration(Number.isFinite(v) ? v : 0);
                      setResult(null);
                    }}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                      durationTooLong
                        ? 'border-rose-400 text-rose-700 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-sky-200'
                    }`}
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Up to {MAX_DURATION_MINUTES} minutes. Exactly 120 is allowed.
                  </p>
                </div>
              </div>

              {candidate && (
                <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                  Requested window:{' '}
                  <span className="font-mono font-medium text-slate-800">
                    {minutesToLabel(candidate.start)}–
                    {minutesToLabel(candidate.end)}
                  </span>{' '}
                  ({durationMinutes(candidate)} min)
                </div>
              )}

              <button
                type="button"
                onClick={handleCheck}
                className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 active:scale-[.99]"
              >
                Check availability
              </button>
            </section>

            {/* Result */}
            {result && (
              <section className="mb-5">
                <StatusBanner status={result.status} reasons={result.reasons} />
              </section>
            )}

            {/* Timeline */}
            <section className="mb-5">
              <Timeline
                room={room}
                candidate={candidateForTimeline}
                nowMinutes={nowMinutes}
              />
            </section>

            {/* Existing bookings */}
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Existing bookings today ({room.bookings.length})
              </h3>
              <div className="space-y-2">
                {room.bookings.map((b) => (
                  <BookingChip
                    key={b.id}
                    start={b.start}
                    end={b.end}
                    title={b.title}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="mb-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-8 text-center text-sm text-slate-500">
            Select a room from the list above to check its availability.
          </section>
        )}

        <footer className="border-t border-slate-200 pt-5 text-xs text-slate-400">
          Fictional data for demonstration. This page checks availability only
          and does not create or confirm bookings.
        </footer>
      </div>
    </div>
  );
}
