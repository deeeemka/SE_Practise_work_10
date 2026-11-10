import { Users } from 'lucide-react';

interface RoomFiltersProps {
  attendees: number | null;
  equipmentOptions: string[];
  requiredEquipment: string[];
  onAttendeesChange: (value: number | null) => void;
  onToggleEquipment: (item: string) => void;
}

export default function RoomFilters({
  attendees,
  equipmentOptions,
  requiredEquipment,
  onAttendeesChange,
  onToggleEquipment,
}: RoomFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label
          htmlFor="attendees"
          className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"
        >
          <Users className="h-3.5 w-3.5" /> Number of attendees
        </label>
        <input
          id="attendees"
          type="number"
          min={1}
          step={1}
          value={attendees ?? ''}
          onChange={(e) => {
            const v = Number(e.target.value);
            onAttendeesChange(e.target.value !== '' && Number.isInteger(v) && v >= 1 ? v : null);
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
        <p className="mt-1.5 text-[11px] text-slate-400">
          {attendees === null
            ? 'Showing rooms of any size.'
            : `Showing rooms that seat at least ${attendees}.`}
        </p>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-slate-500">
          Required equipment
        </legend>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const checked = requiredEquipment.includes(item);
            return (
              <label
                key={item}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  checked
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleEquipment(item)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                {item}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
