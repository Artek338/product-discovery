import { useState } from 'react'
import { Key, Cpu, Globe, Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { t } from '../lib/i18n'

const MODELS = [
  { value: 'claude-sonnet-4-6',       label: 'Claude Sonnet 4.6 (domyślny / default)' },
  { value: 'claude-opus-4-6',         label: 'Claude Opus 4.6 (najsilniejszy / strongest)' },
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
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-sans font-semibold text-[#0D2535] mb-1">
          {t(language, 'set_title')}
        </h1>
        <p className="text-slate-500 font-sans text-sm">
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
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-sans font-semibold transition-all ${
                  language === lang
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

        {/* ── Zapis ────────────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all shadow-sm flex items-center gap-2 ${
              saved
                ? 'bg-[#10B981] text-white'
                : 'bg-[#14B8A6] hover:bg-[#0D9488] text-white'
            }`}
          >
            {saved ? t(language, 'set_saved') : t(language, 'set_save')}
          </button>
        </div>
      </div>
    </div>
  )
}
