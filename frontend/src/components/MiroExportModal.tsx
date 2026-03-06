import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, Layers, FlaskConical } from 'lucide-react'
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
  const firstInputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Przywracanie focusu po zamknięciu + Escape
  useEffect(() => {
    triggerRef.current = document.activeElement
    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    if (firstInputRef.current && !dryRun) {
      firstInputRef.current.focus()
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, dryRun])

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="miro-modal-title"
      data-testid="miro-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(13,37,53,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Layers size={18} style={{ color: '#14B8A6' }} />
            <h2 id="miro-modal-title" className="font-mono font-bold text-[#0D2535]">Eksport do Miro</h2>
          </div>
          <button onClick={onClose} aria-label="Zamknij modal eksportu Miro" className="text-slate-400 hover:text-[#0D2535] transition-colors">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Dry-run toggle */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical size={16} className="text-[#14B8A6]" />
                <p className="text-sm font-sans font-semibold text-[#0D2535]">Tryb testowy (dry run)</p>
              </div>
              <p className="text-xs text-slate-500 font-sans leading-relaxed pr-4">
                Symuluje eksport bez konta Miro — zero wywołań API.<br />Zobaczysz log systemowy.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={dryRun}
              onClick={() => setDryRun(!dryRun)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:ring-offset-2 ${dryRun ? 'bg-[#14B8A6]' : 'bg-slate-200'
                }`}
            >
              <span className="sr-only">Włącz tryb testowy</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dryRun ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
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
                ref={firstInputRef}
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
          <div className="flex gap-3 pt-4 justify-end border-t border-[#E2E8F0]">
            <button onClick={onClose} className="btn-secondary px-6">
              Zamknij
            </button>
            <button
              onClick={handleExport}
              disabled={loading || (!dryRun && (!token || !boardId))}
              className="btn-primary px-8"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {dryRun ? 'Symulowanie...' : 'Eksportowanie...'}
                </span>
              ) : dryRun ? 'Testuj (dry run)' : 'Eksportuj do Miro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
