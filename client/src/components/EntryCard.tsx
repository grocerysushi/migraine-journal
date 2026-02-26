import { useNavigate } from 'react-router-dom';
import type { MigraineEntry } from '../models';
import { intensityColor } from '../utils/insights';
import { formatDateTime, durationMinutes, formatDuration } from '../utils/dateHelpers';

interface Props { entry: MigraineEntry; onDelete: (id: string) => void }

export function EntryCard({ entry, onDelete }: Props) {
  const navigate = useNavigate();
  const color  = intensityColor(entry.pain_intensity);
  const duration = entry.date_time_end
    ? formatDuration(durationMinutes(entry.date_time_start, entry.date_time_end))
    : null;

  const triggerList = entry.triggers
    .slice(0, 3)
    .map(t => t.other_text || t.trigger.replace(/_/g, ' '))
    .join(' · ');

  return (
    <div
      onClick={() => navigate(`/edit/${entry.id}`)}
      className="group bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)]
                 overflow-hidden flex cursor-pointer motion-safe:active:scale-[0.99]
                 motion-safe:transition-all motion-safe:duration-150
                 hover:shadow-md hover:border-[var(--accent-muted)]/40"
    >
      <div className="w-1.5 flex-shrink-0 rounded-l-2xl" style={{ backgroundColor: color }} />

      <div className="flex-1 px-4 py-4 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: color + '20', color }}
          >
            {entry.pain_intensity}/10
          </span>
          {duration && (
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              {duration}
            </span>
          )}
          <span className="ml-auto text-xs text-[var(--text-tertiary)] shrink-0">
            {formatDateTime(entry.date_time_start)}
          </span>
        </div>

        {entry.triggers.length > 0 && (
          <p className="text-sm font-semibold text-[var(--text-primary)] capitalize mb-1 truncate">
            {triggerList}
            {entry.triggers.length > 3 && (
              <span className="text-[var(--text-tertiary)] font-normal"> +{entry.triggers.length - 3}</span>
            )}
          </p>
        )}

        {entry.symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {entry.symptoms.slice(0, 4).map(s => (
              <span key={s} className="text-[11px] bg-[var(--accent)]/10 text-[var(--accent)] font-medium
                                       px-2 py-0.5 rounded-full capitalize border border-[var(--accent)]/20">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
            {entry.symptoms.length > 4 && (
              <span className="text-[11px] bg-[var(--surface-elevated)] text-[var(--text-tertiary)] font-medium px-2 py-0.5 rounded-full">
                +{entry.symptoms.length - 4}
              </span>
            )}
          </div>
        )}

        {entry.notes && (
          <p className="text-xs text-[var(--text-tertiary)] italic mt-2 truncate">{entry.notes}</p>
        )}
      </div>

      <button
        onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
        className="self-start mt-3 mr-3 min-w-[44px] min-h-[44px] flex items-center justify-center
                   rounded-full text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-400
                   motion-safe:transition-all motion-safe:duration-150 text-base"
        title="Delete"
      >
        ×
      </button>
    </div>
  );
}
