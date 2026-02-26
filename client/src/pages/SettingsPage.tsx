import { useRef, useState } from 'react';
import { api } from '../api/client';
import { useTheme } from '../hooks/useTheme';

type ThemeOption = 'light' | 'dark' | 'system';
const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

function ActionRow({ title, sub, onClick, danger, loading }: {
  title: string; sub?: string; onClick: () => void; danger?: boolean; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 min-h-[56px]
                 hover:bg-[var(--surface-elevated)] active:bg-[var(--surface-elevated)]
                 motion-safe:transition-colors text-left"
    >
      <div>
        <p className={`text-sm font-semibold ${danger ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>{title}</p>
        {sub && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{sub}</p>}
      </div>
      {loading
        ? <div className="w-4 h-4 border-2 border-[var(--muted)] border-t-[var(--accent)] rounded-full motion-safe:animate-spin" />
        : <span className={`text-lg font-light ${danger ? 'text-red-300' : 'text-[var(--text-tertiary)]'}`}>›</span>}
    </button>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [wiping,    setWiping]    = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const handleExport = async () => {
    setExporting(true);
    try { await api.exportData(); showMsg('Exported successfully'); }
    catch (e) { showMsg(`Error: ${String(e)}`); }
    finally { setExporting(false); }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const json = await file.text();
      const result = await api.importData(json);
      showMsg(`Imported ${result.imported}, skipped ${result.skipped}`);
    } catch (err) {
      showMsg(`Error: ${String(err)}`);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleWipe = async () => {
    if (!window.confirm('Permanently delete ALL entries? This cannot be undone.')) return;
    setWiping(true);
    try { await api.wipeData(); showMsg('All data deleted'); }
    catch (e) { showMsg(`Error: ${String(e)}`); }
    finally { setWiping(false); }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur-md px-5 pt-10 pb-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Settings</h1>
      </div>

      <div className="px-4 pb-8">
        {/* Toast */}
        {msg && (
          <div className={`rounded-2xl px-4 py-3 mb-4 mt-2 text-sm font-semibold
            ${msg.startsWith('Error')
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {msg}
          </div>
        )}

        {/* Appearance */}
        <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 mt-4 px-1">Appearance</p>
        <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden mb-4 p-4">
          <div className="flex gap-2">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold min-h-[48px]
                           motion-safe:transition-all
                  ${theme === opt.value
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data section */}
        <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 px-1">Data</p>
        <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden mb-4">
          <ActionRow
            title="Export to JSON"
            sub="Download all entries as a backup file"
            onClick={handleExport}
            loading={exporting}
          />
          <div className="h-px bg-[var(--border)] mx-5" />
          <ActionRow
            title="Import from JSON"
            sub="Merge entries from a backup file"
            onClick={() => fileRef.current?.click()}
            loading={importing}
          />
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>

        {/* Danger zone */}
        <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 px-1">Danger Zone</p>
        <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          <ActionRow
            title="Wipe All Data"
            sub="Permanently delete all entries — cannot be undone"
            onClick={handleWipe}
            danger
            loading={wiping}
          />
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-10 font-medium">Migraine Journal · v1.0.0</p>
      </div>
    </div>
  );
}
