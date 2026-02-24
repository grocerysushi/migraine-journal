interface Option { value: string; label: string }

interface Props {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  label?: string;
  error?: string;
}

export function MultiSelect({ options, selected, onChange, label, error }: Props) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);

  return (
    <div className="mb-4">
      {label && <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors
                ${active
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
