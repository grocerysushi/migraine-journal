import { intensityColor, intensityLabel } from '../utils/insights';

interface Props {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  error?: string;
}

export function IntensitySlider({ value, onChange, label, error }: Props) {
  const color = intensityColor(value);
  const lbl   = intensityLabel(value);

  return (
    <div className="mb-5">
      {label && <p className="text-sm font-semibold text-slate-700 mb-3">{label}</p>}

      {/* Current value display */}
      <div className="flex items-baseline gap-2.5 mb-4">
        <span className="text-6xl font-black leading-none tabular-nums" style={{ color }}>
          {value}
        </span>
        <div>
          <p className="text-base font-bold" style={{ color }}>{lbl}</p>
          <p className="text-xs text-slate-400">out of 10</p>
        </div>
      </div>

      {/* Segmented track */}
      <div className="flex gap-1 h-12 items-end">
        {Array.from({ length: 11 }, (_, i) => {
          const active  = i === value;
          const filled  = i <= value;
          const segH    = active ? 48 : Math.max(16, 16 + (i / 10) * 20);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              title={`${i} – ${intensityLabel(i)}`}
              style={{
                height: segH,
                backgroundColor: filled ? intensityColor(i) : '#E2E8F0',
                outline: active ? `2px solid ${intensityColor(i)}` : 'none',
                outlineOffset: active ? '2px' : '0',
              }}
              className={`flex-1 rounded-md transition-all duration-100 cursor-pointer
                ${active ? 'scale-y-105 shadow-sm' : 'hover:opacity-80'}`}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2 px-0.5">
        <span>No pain</span>
        <span>Worst possible</span>
      </div>

      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
