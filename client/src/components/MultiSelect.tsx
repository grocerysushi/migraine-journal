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
        <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2.5">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-4 py-2.5 rounded-full text-[13px] font-medium
                          border motion-safe:transition-all motion-safe:duration-100 select-none
                          min-h-[44px]
                ${active
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm'
                  : 'border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] hover:border-[var(--accent-muted)] hover:bg-[var(--surface-elevated)]'
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
