import type { ReactNode } from 'react';

interface Props {
  steps: string[];
  current: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  children: ReactNode;
}

export function StepWizard({ steps, current, onBack, onNext, onSubmit, submitting, children }: Props) {
  const isLast = current === steps.length - 1;
  const isFirst = current === 0;

  return (
    <div>
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full motion-safe:transition-all motion-safe:duration-200
              ${i === current ? 'bg-[var(--accent)] scale-125' : i < current ? 'bg-[var(--accent-muted)]' : 'bg-[var(--muted)]'}`}
            />
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded-full ${i < current ? 'bg-[var(--accent-muted)]' : 'bg-[var(--muted)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1 text-center">
        Step {current + 1} of {steps.length}
      </p>
      <p className="text-lg font-bold text-[var(--text-primary)] mb-5 text-center">{steps[current]}</p>

      {/* Content */}
      {children}

      {/* Nav buttons */}
      <div className="flex gap-3 mt-6">
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 rounded-2xl text-base font-bold min-h-[56px]
                       border border-[var(--border)] text-[var(--text-secondary)]
                       bg-[var(--surface-card)] hover:bg-[var(--surface-elevated)]
                       motion-safe:transition-colors"
          >
            Back
          </button>
        )}
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 py-4 rounded-2xl text-base font-bold min-h-[56px]
                       bg-[var(--accent)] hover:opacity-90 text-white
                       disabled:opacity-60 motion-safe:transition-colors shadow-sm"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full motion-safe:animate-spin" />
                Saving…
              </span>
            ) : 'Log Migraine'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-4 rounded-2xl text-base font-bold min-h-[56px]
                       bg-[var(--accent)] hover:opacity-90 text-white
                       motion-safe:transition-colors shadow-sm"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
