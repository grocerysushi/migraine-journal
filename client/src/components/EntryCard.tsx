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
      className="group bg-white rounded-2xl shadow-sm border border-slate-100
                 overflow-hidden flex cursor-pointer active:scale-[0.99]
                 transition-all duration-150 hover:shadow-md hover:border-slate-200"
    >
      {/* Intensity accent bar */}
      <div className="w-1.5 flex-shrink-0 rounded-l-2xl" style={{ backgroundColor: color }} />

      <div className="flex-1 px-4 py-3.5 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2">
          {/* Pain badge */}
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: color + '20', color }}
          >
            {entry.pain_intensity}/10
          </span>
          {duration && (
            <span className="text-xs text-slate-400 font-medium">
              {duration}
            </span>
          )}
          <span className="ml-auto text-xs text-slate-400 shrink-0">
            {formatDateTime(entry.date_time_start)}
          </span>
        </div>

        {/* Triggers */}
        {entry.triggers.length > 0 && (
          <p className="text-sm font-semibold text-slate-700 capitalize mb-1 truncate">
            {triggerList}
            {entry.triggers.length > 3 && (
              <span className="text-slate-400 font-normal"> +{entry.triggers.length - 3}</span>
            )}
          </p>
        )}

        {/* Symptom chips */}
        {entry.symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {entry.symptoms.slice(0, 4).map(s => (
              <span key={s} className="text-[11px] bg-violet-50 text-violet-600 font-medium
                                       px-2 py-0.5 rounded-full capitalize border border-violet-100">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
            {entry.symptoms.length > 4 && (
              <span className="text-[11px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
                +{entry.symptoms.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <p className="text-xs text-slate-400 italic mt-2 truncate">{entry.notes}</p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
        className="self-start mt-3 mr-3 w-6 h-6 flex items-center justify-center
                   rounded-full text-slate-300 hover:bg-red-50 hover:text-red-400
                   opacity-0 group-hover:opacity-100 transition-all duration-150 text-base"
        title="Delete"
      >
        ×
      </button>
    </div>
  );
}
