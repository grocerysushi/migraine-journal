import { useRef, useState } from 'react';
import { api } from '../api/client';

function Row({ title, sub, onClick, danger, loading }: {
  title: string; sub?: string; onClick: () => void; danger?: boolean; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left"
    >
      <div>
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-gray-800'}`}>{title}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {loading
        ? <span className="text-gray-400 text-sm animate-pulse">…</span>
        : <span className="text-gray-300 text-xl">›</span>}
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
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {msg && (
        <div className={`rounded-lg px-4 py-3 mb-4 text-sm font-medium ${msg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      {/* Data section */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data</p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <Row title="Export to JSON" sub="Download all entries as a JSON file" onClick={handleExport} loading={exporting} />
        <div className="h-px bg-gray-100 mx-4" />
        <Row
          title="Import from JSON"
          sub="Merge entries from a backup file"
          onClick={() => fileRef.current?.click()}
          loading={importing}
        />
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
      </div>

      {/* Danger zone */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Danger Zone</p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Row title="Wipe All Data" sub="Permanently delete all entries" onClick={handleWipe} danger loading={wiping} />
      </div>

      <p className="text-center text-xs text-gray-300 mt-10">Migraine Journal · v1.0.0</p>
    </div>
  );
}
