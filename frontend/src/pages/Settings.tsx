import { useState } from 'react'
import { Key, Cpu, Globe, Eye, EyeOff, BarChart3, CreditCard, ExternalLink } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'

const MODELS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (domyślny / default)' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 (najsilniejszy / strongest)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (najszybszy / fastest)' },
]

export default function Settings() {
  const { language, setLanguage, apiKey, setApiKey, llmModel, setLlmModel } = useAppStore()

  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [localModel, setLocalModel] = useState(llmModel)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setApiKey(localApiKey)
    setLlmModel(localModel)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto p-8 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-semibold text-[#0D2535] mb-1">
          {t(language, 'set_title')}
        </h1>
        <p className="text-slate-500 font-sans text-sm max-w-2xl">
          {language === 'pl'
            ? 'Skonfiguruj język, klucz API i model LLM używany przez aplikację.'
            : 'Configure language, API key and LLM model used by the application.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Język ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center">
              <Globe size={16} style={{ color: '#14B8A6' }} />
            </div>
            <h2 className="font-sans font-semibold text-[#0D2535]">
              {t(language, 'set_lang_title')}
            </h2>
          </div>

          <p className="text-sm text-slate-500 font-sans mb-4">
            {t(language, 'set_lang_desc')}
          </p>

          <div className="flex gap-3">
            {(['pl', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-sans font-semibold transition-all ${language === lang
                  ? 'border-[#14B8A6] bg-[#F0FDFA] text-[#0D9488]'
                  : 'border-[#E2E8F0] bg-white text-slate-500 hover:border-[#CCFBF1]'
                  }`}
              >
                {lang === 'pl' ? '🇵🇱  Polski' : '🇬🇧  English'}
              </button>
            ))}
          </div>
        </div>

        {/* ── API & Model ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center">
              <Cpu size={16} style={{ color: '#14B8A6' }} />
            </div>
            <h2 className="font-sans font-semibold text-[#0D2535]">
              {t(language, 'set_api_title')}
            </h2>
          </div>

          {/* API Key */}
          <div className="mb-5">
            <label className="block text-sm font-sans font-semibold text-[#0D2535] mb-1.5">
              {t(language, 'set_api_key')}
            </label>
            <div className="relative">
              <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={e => setLocalApiKey(e.target.value)}
                placeholder={t(language, 'set_api_key_ph')}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-10 py-2.5 text-[#0D2535] text-sm font-mono outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0D2535] transition-colors"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-1.5">
              {t(language, 'set_api_key_hint')}
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-sans font-semibold text-[#0D2535] mb-1.5">
              {t(language, 'set_model')}
            </label>
            <select
              value={localModel}
              onChange={e => setLocalModel(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[#0D2535] text-sm font-sans outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] transition-all cursor-pointer"
            >
              {MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 font-sans mt-1.5">
              {t(language, 'set_model_hint')}
            </p>
          </div>
        </div>

        {/* ── Zużycie i Koszty (shadcn-like card) ────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
                <BarChart3 size={16} className="text-orange-500" />
              </div>
              <div>
                <h2 className="font-sans font-semibold text-[#0D2535]">
                  {t(language, 'usage_title')}
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  {t(language, 'usage_desc')}
                </p>
              </div>
            </div>
            <a href="#" className="flex items-center gap-1.5 text-xs font-sans font-medium text-slate-400 hover:text-[#14B8A6] transition-colors">
              Anthropic Console <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tokens */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-sans font-medium text-slate-500">
                  {t(language, 'usage_tokens')}
                </p>
                <Cpu size={14} className="text-slate-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-sans font-bold text-[#0D2535]">284k</span>
                <span className="text-xs font-sans text-slate-400">/ 1M</span>
              </div>
              <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            {/* Cost */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-sans font-medium text-slate-500">
                  {t(language, 'usage_cost')}
                </p>
                <CreditCard size={14} className="text-slate-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-sans font-bold text-[#0D2535]">$1.42</span>
                <span className="text-xs font-sans text-slate-400">USD</span>
              </div>
              <p className="text-xs font-sans text-slate-400 mt-2">
                {t(language, 'usage_cycle')}
              </p>
            </div>

            {/* Limit */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-sans font-medium text-slate-500">
                  {t(language, 'usage_limit')}
                </p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-sans font-bold text-[#0D2535]">$10.00</span>
                <span className="text-xs font-sans text-slate-400">USD/mc</span>
              </div>
              <p className="text-xs font-sans text-emerald-500 font-medium mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Status: OK
              </p>
            </div>
          </div>
        </div>

        {/* ── Zapis ────────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-md text-sm font-sans font-medium transition-all shadow-sm flex items-center gap-2 ${saved
              ? 'bg-[#10B981] text-white border border-[#10B981]'
              : 'bg-[#14B8A6] hover:bg-[#0D9488] text-white border border-transparent'
              }`}
          >
            {saved ? t(language, 'set_saved') : t(language, 'set_save')}
          </button>
        </div>
      </div>
    </div>
  )
}
