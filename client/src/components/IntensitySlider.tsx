import { intensityColor, intensityLabel } from '../utils/insights';

interface Props {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  error?: string;
}

export function IntensitySlider({ value, onChange, label, error }: Props) {
  const color = intensityColor(value);

  return (
    <div className="mb-4">
      {label && <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-5xl font-bold" style={{ color }}>{value}</span>
        <span className="text-lg font-medium" style={{ color }}>{intensityLabel(value)}</span>
      </div>
      <div className="flex gap-1 h-10 items-center">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            title={`${i} – ${intensityLabel(i)}`}
            className={`flex-1 rounded transition-all ${i === value ? 'h-10' : 'h-6'}`}
            style={{
              backgroundColor: i <= value ? intensityColor(i) : '#E5E7EB',
              outline: i === value ? `2px solid ${intensityColor(i)}` : 'none',
              outlineOffset: '2px',
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
        <span>0</span><span>5</span><span>10</span>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
