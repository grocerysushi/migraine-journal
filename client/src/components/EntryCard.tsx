import { useNavigate } from 'react-router-dom';
import type { MigraineEntry } from '../models';
import { intensityColor, intensityBg } from '../utils/insights';
import { formatDateTime, durationMinutes, formatDuration } from '../utils/dateHelpers';

interface Props { entry: MigraineEntry; onDelete: (id: string) => void }

export function EntryCard({ entry, onDelete }: Props) {
  const navigate = useNavigate();
  const color = intensityColor(entry.pain_intensity);
  const duration = entry.date_time_end
    ? formatDuration(durationMinutes(entry.date_time_start, entry.date_time_end))
    : null;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/edit/${entry.id}`)}
    >
      {/* intensity bar */}
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />

      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${intensityBg(entry.pain_intensity)}`}>
            {entry.pain_intensity}/10
          </span>
          <span className="text-xs text-gray-400">{formatDateTime(entry.date_time_start)}</span>
        </div>

        {duration && <p className="text-xs text-gray-500 mb-1">Duration: {duration}</p>}

        {entry.triggers.length > 0 && (
          <p className="text-sm text-gray-700 font-medium capitalize truncate">
            {entry.triggers.slice(0, 3).map(t => t.other_text || t.trigger.replace(/_/g, ' ')).join(', ')}
            {entry.triggers.length > 3 && ` +${entry.triggers.length - 3} more`}
          </p>
        )}

        {entry.symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {entry.symptoms.slice(0, 3).map(s => (
              <span key={s} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full capitalize">
                {s.replace(/_/g, ' ')}
              </span>
            ))}
            {entry.symptoms.length > 3 && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                +{entry.symptoms.length - 3}
              </span>
            )}
          </div>
        )}

        {entry.notes && (
          <p className="text-xs text-gray-400 italic mt-1 truncate">{entry.notes}</p>
        )}
      </div>

      <button
        onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
        className="self-start mt-3 mr-3 text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
        title="Delete entry"
      >
        ×
      </button>
    </div>
  );
}
