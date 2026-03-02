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
        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
          selected
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {profile.archetype_name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {profile.demographics}
            </p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`card p-5 cursor-pointer transition-all ${
        selected ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <h3 className="font-bold text-gray-900">{profile.archetype_name}</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profil</span>
          <p className="text-gray-700 mt-0.5">{profile.demographics}</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Psychologia</span>
          <p className="text-gray-700 mt-0.5 text-xs">{profile.psychology}</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">JTBD</span>
          <p className="text-gray-700 mt-0.5 text-xs italic">{profile.jtbd_hypothesis}</p>
        </div>

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Hipotezy do sprawdzenia
          </span>
          <ul className="mt-1 space-y-0.5">
            {profile.hypotheses_to_test.slice(0, 2).map((h, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-indigo-500 mt-0.5">•</span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        {profile.red_flags_expected.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
              🚩 Red flags
            </span>
            <p className="text-xs text-red-600 mt-0.5">{profile.red_flags_expected[0]}</p>
          </div>
        )}
      </div>
    </div>
  )
}
