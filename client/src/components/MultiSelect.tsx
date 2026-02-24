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
    <div className="mb-5">
      {label && (
        <p className="text-sm font-semibold text-slate-700 mb-2.5">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium
                          border transition-all duration-100 select-none
                ${active
                  ? 'border-violet-400 bg-violet-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
