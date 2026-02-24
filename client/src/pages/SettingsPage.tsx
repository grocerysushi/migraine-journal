import { useRef, useState } from 'react';
import { api } from '../api/client';

function ActionRow({ title, sub, onClick, danger, loading }: {
  title: string; sub?: string; onClick: () => void; danger?: boolean; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
    >
      <div>
        <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-slate-800'}`}>{title}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {loading
        ? <div className="w-4 h-4 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
        : <span className={`text-lg font-light ${danger ? 'text-red-300' : 'text-slate-300'}`}>›</span>}
    </button>
  );
}

export function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [wiping,    setWiping]    = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const handleExport = async () => {
    setExporting(true);
    try { await api.exportData(); showMsg('✓ Exported successfully'); }
    catch (e) { showMsg(`✗ ${String(e)}`); }
    finally { setExporting(false); }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const json = await file.text();
      const result = await api.importData(json);
      showMsg(`✓ Imported ${result.imported}, skipped ${result.skipped}`);
    } catch (err) {
      showMsg(`✗ ${String(err)}`);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleWipe = async () => {
    if (!window.confirm('Permanently delete ALL entries? This cannot be undone.')) return;
    setWiping(true);
    try { await api.wipeData(); showMsg('✓ All data deleted'); }
    catch (e) { showMsg(`✗ ${String(e)}`); }
    finally { setWiping(false); }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f0f2f8]/90 backdrop-blur-md px-5 pt-10 pb-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
      </div>

      <div className="px-4 pb-8">
        {/* Toast */}
        {msg && (
          <div className={`rounded-2xl px-4 py-3 mb-4 mt-2 text-sm font-semibold
            ${msg.startsWith('✓')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {msg}
          </div>
        )}

        {/* Data section */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4 px-1">Data</p>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
          <ActionRow
            title="Export to JSON"
            sub="Download all entries as a backup file"
            onClick={handleExport}
            loading={exporting}
          />
          <div className="h-px bg-slate-100 mx-5" />
          <ActionRow
            title="Import from JSON"
            sub="Merge entries from a backup file"
            onClick={() => fileRef.current?.click()}
            loading={importing}
          />
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>

        {/* Danger zone */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Danger Zone</p>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <ActionRow
            title="Wipe All Data"
            sub="Permanently delete all entries — cannot be undone"
            onClick={handleWipe}
            danger
            loading={wiping}
          />
        </div>

        <p className="text-center text-xs text-slate-300 mt-10 font-medium">Migraine Journal · v1.0.0</p>
      </div>
    </div>
  );
}
