import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, X, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'
import type { DiscoveryMode } from '../types/discovery'

export default function NewDiscovery() {
  const navigate = useNavigate()
  const { language } = useAppStore()

  const MODES: { value: DiscoveryMode; label: string; desc: string; dot: string }[] = [
    { value: 'auto', label: 'Auto', desc: t(language, 'nd_mode_auto_desc'), dot: 'bg-[#8B5CF6]' },
    { value: 'problem', label: 'Problem', desc: t(language, 'nd_mode_problem_desc'), dot: 'bg-[#F97316]' },
    { value: 'solution', label: 'Solution', desc: t(language, 'nd_mode_solution_desc'), dot: 'bg-[#14B8A6]' },
  ]

  const [idea, setIdea] = useState('')
  const [projectName, setProjectName] = useState('')
  const [mode, setMode] = useState<DiscoveryMode>('auto')
  const [interviewNotes, setInterviewNotes] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim() || !projectName.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await api.runDiscovery({
        idea: idea.trim(),
        project_name: projectName.trim(),
        mode,
        interview_notes: interviewNotes.trim() || undefined,
      })
      navigate(`/discovery/${res.session_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd uruchamiania Discovery')
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => setInterviewNotes(ev.target?.result as string)
    reader.readAsText(file)
  }

  const handleRemoveFile = () => {
    setFileName('')
    setInterviewNotes('')
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-semibold text-[#0D2535] mb-2">
          {t(language, 'nd_title')}
        </h1>
        <p className="text-slate-500 font-sans text-sm max-w-2xl">
          {t(language, 'nd_subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] space-y-8">
        {/* Nazwa projektu */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] mb-2">
            {t(language, 'nd_project_name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder={t(language, 'nd_project_ph')}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[#0D2535] outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans"
            required
          />
        </div>

        {/* Opis pomysłu */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] mb-2">
            {t(language, 'nd_idea')} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            rows={5}
            placeholder={t(language, 'nd_idea_ph')}
            className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#0D2535] outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none"
            required
          />
          <p className="text-xs text-slate-400 font-sans mt-2">
            {t(language, 'nd_idea_hint')}
          </p>
        </div>

        {/* Tryb Discovery */}
        <div>
          <label className="block font-sans text-sm font-semibold text-[#0D2535] mb-3">
            {t(language, 'nd_mode')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODES.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-xl border-2 transition-all ${mode === m.value
                  ? 'border-[#14B8A6] bg-[#F0FDFA]'
                  : 'border-[#E2E8F0] hover:border-[#CCFBF1] bg-white'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${m.dot}`} />
                  <span className="font-sans font-semibold text-sm text-[#0D2535]">{m.label}</span>
                </div>
                <div className="text-xs text-slate-500 font-sans leading-snug">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notatki z wywiadów */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-sans text-sm font-semibold text-[#0D2535]">
              {t(language, 'nd_notes')}
            </label>
            <div className="flex items-center gap-3">
              {fileName && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDFA] text-[#0D9488] text-xs font-sans font-semibold rounded-full border border-[#CCFBF1]">
                  <span className="truncate max-w-[150px]">{fileName}</span>
                  <button type="button" onClick={handleRemoveFile} className="hover:text-teal-900 p-0.5 rounded-full hover:bg-teal-100 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              )}
              <span className="text-xs text-slate-400 font-sans font-medium px-2 py-0.5 bg-slate-100 rounded">
                {t(language, 'nd_notes_optional')}
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={interviewNotes}
              onChange={e => {
                setInterviewNotes(e.target.value)
                if (!e.target.value) setFileName('')
              }}
              rows={4}
              placeholder={t(language, 'nd_notes_ph')}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 pt-3 pb-12 text-[#0D2535] outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all font-sans resize-none text-sm"
            />
            <div className="absolute bottom-2 right-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#0D2535] font-sans font-semibold bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                <LinkIcon size={14} className="text-slate-400" />
                {t(language, 'nd_attach')}
                <input type="file" accept=".md,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Błąd */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] p-4 text-sm text-[#DC2626] font-sans">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <hr className="border-[#E2E8F0]" />

        {/* Akcje */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-lg text-sm font-sans font-medium text-slate-500 hover:text-[#0D2535] hover:bg-slate-50 transition-colors"
          >
            {t(language, 'nd_cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || !idea.trim() || !projectName.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-sans font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white/70" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t(language, 'nd_launching')}
              </>
            ) : (
              t(language, 'nd_launch')
            )}
          </button>
        </div>

      </div>
    </form>
  )
}
