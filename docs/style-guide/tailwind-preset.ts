/**
 * Product Builder — Tailwind Preset
 *
 * Drop-in preset for new projects.
 * Usage in tailwind.config.ts:
 *
 *   import productBuilderPreset from './docs/style-guide/tailwind-preset'
 *
 *   export default {
 *     presets: [productBuilderPreset],
 *     darkMode: 'class',
 *     content: ['./src/**\/*.{js,ts,jsx,tsx}'],
 *   }
 */

import type { Config } from 'tailwindcss'

const preset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand Teal (Primary) ──
        teal: {
          100: '#CCFBF1',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },

        // ── Neutrals ──
        sidebar: '#0D2535',
        'dark-800': '#1C2E40',
        'dark-950': '#0D1117',

        // ── Semantic ──
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        orange: '#F97316',
        violet: '#8B5CF6',

        // ── UI Surface ──
        surface: '#F8FAFC',
        border: '#E2E8F0',

        // ── Verdict ──
        go: '#15803D',
        nogo: '#DC2626',
        needs: '#B45309',

        // ── Chart ──
        'chart-completed': '#14B8A6',
        'chart-failed': '#FF8A65',
        'chart-queued': '#FBBF24',
        'chart-track': '#F1F5F9',

        // ── Dark Mode Surfaces ──
        'dark-body': '#111111',
        'dark-content': '#141414',
        'dark-card': '#1A1A1A',
        'dark-hover': '#222222',
        'dark-hover-strong': '#2A2A2A',
        'dark-border': '#333333',

        // ── Nav ──
        'nav-inactive': '#8BB5CC',
        'nav-section': '#4A7090',
      },

      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        card: '12px',
        btn: '8px',
        badge: '999px',
      },

      boxShadow: {
        chat: '0 2px 10px -4px rgba(0, 0, 0, 0.05)',
      },

      width: {
        sidebar: '256px',
      },

      height: {
        header: '80px',
      },

      maxWidth: {
        dashboard: '1600px',
        settings: '672px',
      },
    },
  },
}

export default preset
