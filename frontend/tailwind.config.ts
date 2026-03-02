import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Teal (Primary)
        teal: {
          100: '#CCFBF1',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        // Neutrals
        sidebar: '#0D2535',
        'dark-800': '#1C2E40',
        'dark-950': '#0D1117',
        // Semantic
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        orange: '#F97316',
        violet: '#8B5CF6',
        // UI surface
        surface: '#F8FAFC',
        border: '#E2E8F0',
        // Verdict legacy (kept for compat)
        go: '#15803D',
        nogo: '#DC2626',
        needs: '#B45309',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        badge: '999px',
      },
    },
  },
  plugins: [],
}

export default config
