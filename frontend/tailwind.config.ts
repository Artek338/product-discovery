import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        go: '#16a34a',
        nogo: '#dc2626',
        needs: '#d97706',
      },
    },
  },
  plugins: [],
}

export default config
