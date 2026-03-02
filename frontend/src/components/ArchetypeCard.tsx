import type { SyntheticProfile } from '../types/discovery'

interface Props {
  profile: SyntheticProfile
  selected?: boolean
  onClick?: () => void
  compact?: boolean
}

const ARCHETYPE_ICONS: Record<string, string> = {
  'value seeker': '💰',
  'treatonomics': '🍬',
  'ai-assisted': '🤖',
  'digital-native': '🎨',
  'creator': '🎨',
}

function getIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(ARCHETYPE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '👤'
}

export default function ArchetypeCard({ profile, selected, onClick, compact }: Props) {
  const icon = getIcon(profile.archetype_name)

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected
          ? 'border-[#14B8A6] bg-[#F0FDFA] shadow-sm'
          : 'border-[#E2E8F0] bg-white hover:border-[#2DD4BF] hover:shadow-sm'
          }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[#0D2535] truncate font-sans">
              {profile.archetype_name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 font-sans">
              {profile.demographics}
            </p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl p-6 transition-all ${selected ? 'border-2 border-[#14B8A6] shadow-md relative' : 'border border-[#E2E8F0] shadow-sm hover:shadow-md cursor-pointer hover:border-[#2DD4BF]'
        }`}
      onClick={onClick}
    >
      {selected && (
        <div className="absolute top-4 right-4 text-[#14B8A6]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm">
            {icon}
          </div>
          <div>
            <h3 className="font-sans font-bold text-[#0D2535] text-lg leading-tight">{profile.archetype_name}</h3>
            <p className="text-sm font-sans text-slate-500 mt-0.5 line-clamp-1">{profile.demographics}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest block mb-1">Psychology</span>
          <p className="text-slate-600 text-sm font-sans leading-relaxed">{profile.psychology}</p>
        </div>

        <div>
          <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest block mb-1">Primary JTBD</span>
          <p className="text-slate-700 text-sm font-sans italic bg-slate-50 p-3 rounded-lg border border-slate-100">{profile.jtbd_hypothesis}</p>
        </div>

        {profile.red_flags_expected.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-sans font-semibold text-red-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
              Behavioral Red Flags
            </span>
            <p className="text-sm text-red-600 font-sans">{profile.red_flags_expected[0]}</p>
          </div>
        )}
      </div>
    </div>
  )
}
