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
      {label && <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">{label}</p>}

      <div className="flex items-baseline gap-2.5 mb-4">
        <span className="text-6xl font-black leading-none tabular-nums" style={{ color }}>
          {value}
        </span>
        <div>
          <p className="text-base font-bold" style={{ color }}>{lbl}</p>
          <p className="text-xs text-[var(--text-tertiary)]">out of 10</p>
        </div>
      </div>

      <div className="flex gap-1 items-end" style={{ height: 48 }}>
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
                backgroundColor: filled ? intensityColor(i) : 'var(--muted)',
                outline: active ? `2px solid ${intensityColor(i)}` : 'none',
                outlineOffset: active ? '2px' : '0',
              }}
              className="flex-1 rounded-md motion-safe:transition-all motion-safe:duration-100
                         cursor-pointer min-h-[48px] min-w-[44px]
                         hover:opacity-80"
            />
          );
        })}
      </div>

      <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] font-medium mt-2 px-0.5">
        <span>No pain</span>
        <span>Worst possible</span>
      </div>

      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
