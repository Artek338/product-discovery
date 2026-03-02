import { useState } from 'react'
import { X, ExternalLink, Layers } from 'lucide-react'
import { api } from '../lib/api'

interface Props {
  sessionId: string
  onClose: () => void
}

interface ExportResult {
  url: string
  items_created: number
  dry_run: boolean
  log: string[]
}

export default function MiroExportModal({ sessionId, onClose }: Props) {
  const [token, setToken] = useState('')
  const [boardId, setBoardId] = useState('')
  const [dryRun, setDryRun] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExportResult | null>(null)
  const [error, setError] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.exportMiro(sessionId, {
        token: token || undefined,
        board_id: boardId || undefined,
        dry_run: dryRun,
        sections: ['all'],
      })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Błąd eksportu')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(13,37,53,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Layers size={18} style={{ color: '#14B8A6' }} />
            <h2 className="font-mono font-bold text-[#0D2535]">Eksport do Miro</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-[#0D2535] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Dry-run toggle */}
          <div
            className="flex items-start gap-3 p-3 rounded-[8px] cursor-pointer"
            style={{ backgroundColor: dryRun ? '#F0FDFA' : '#F8FAFC', border: `1px solid ${dryRun ? '#14B8A6' : '#E2E8F0'}` }}
            onClick={() => setDryRun(v => !v)}
          >
            <div
              className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border-2 transition-colors"
              style={{
                borderColor: dryRun ? '#14B8A6' : '#CBD5E1',
                backgroundColor: dryRun ? '#14B8A6' : 'white',
              }}
            >
              {dryRun && <span className="text-white text-[10px] font-bold">✓</span>}
            </div>
            <div>
              <p className="text-sm font-sans font-semibold text-[#0D2535]">Tryb testowy (dry run)</p>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Symuluje eksport bez konta Miro — zero wywołań API. Zobaczysz log co zostanie stworzone.
              </p>
            </div>
          </div>

          {/* Token i Board ID */}
          <div className={`space-y-3 transition-opacity ${dryRun ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-sans font-medium text-[#0D2535] mb-1">
                Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="input"
                disabled={dryRun}
              />
              <p className="text-xs text-slate-400 font-sans mt-1">
                Miro → Profile → Apps → Your apps → Token
              </p>
            </div>
            <div>
              <label className="block text-sm font-sans font-medium text-[#0D2535] mb-1">
                Board ID
              </label>
              <input
                type="text"
                value={boardId}
                onChange={e => setBoardId(e.target.value)}
                placeholder="uXjVNxxxxxxxx="
                className="input"
                disabled={dryRun}
              />
              <p className="text-xs text-slate-400 font-sans mt-1">
                Z URL tablicy: miro.com/app/board/<span className="font-mono">{'<board_id>'}</span>/
              </p>
            </div>
          </div>

          {/* Błąd */}
          {error && (
            <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEE2E2] p-3 text-sm text-[#DC2626] font-sans">
              {error}
            </div>
          )}

          {/* Wynik */}
          {result && (
            <div
              className="rounded-[8px] border p-4 space-y-3"
              style={{
                borderColor: result.dry_run ? '#14B8A6' : '#86EFAC',
                backgroundColor: result.dry_run ? '#F0FDFA' : '#DCFCE7',
              }}
            >
              <p className="text-sm font-sans font-semibold text-[#0D2535]">
                {result.dry_run ? '🧪 Symulacja zakończona' : '🎉 Eksport zakończony!'}
                {' '}<span className="font-normal text-slate-500">({result.items_created} elementów)</span>
              </p>

              {!result.dry_run && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex text-sm"
                >
                  <ExternalLink size={14} />
                  Otwórz tablicę Miro
                </a>
              )}

              {result.log.length > 0 && (
                <details>
                  <summary className="text-xs text-slate-500 cursor-pointer font-sans hover:text-[#14B8A6]">
                    Log ({result.log.length} operacji)
                  </summary>
                  <div
                    className="mt-2 rounded-[8px] p-3 max-h-40 overflow-y-auto"
                    style={{ backgroundColor: '#0D2535' }}
                  >
                    {result.log.map((line, i) => (
                      <p key={i} className="text-xs font-mono leading-5" style={{ color: '#2DD4BF' }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Akcje */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleExport}
              disabled={loading || (!dryRun && (!token || !boardId))}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {dryRun ? 'Symulowanie...' : 'Eksportowanie...'}
                </span>
              ) : dryRun ? 'Testuj (dry run)' : 'Eksportuj do Miro'}
            </button>
            <button onClick={onClose} className="btn-secondary">
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
