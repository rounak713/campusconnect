/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Warm dark surfaces — coffee-tinted */
        noir: {
          950: '#0D0C0A',
          900: '#12110F', // App background — warm near-black
          850: '#1C1A18', // Cards / surfaces
          800: '#242220', // Secondary surfaces
          750: '#2C2A27',
          700: '#353229',
          600: '#433F38',
          500: '#5C5750',
        },
        /* Hinge-inspired accent purple */
        hinge: {
          purple: '#6F38E8',
          hover:  '#5E27D8',
          dark:   '#4819B8',
          light:  '#EDE8FF',
          muted:  'rgba(111, 56, 232, 0.15)',
        },
        /* Old navy aliases (kept for legacy component compat) */
        navy: {
          950: '#060A14',
          900: '#0A0F1D',
          850: '#0E1528',
          800: '#131C33',
        },
        /* Semantic colors */
        'neon-violet': '#8B5CF6',
        /* Text tones — warm cream */
        bone:   '#E8E1D5',
        subtle: '#9A9181',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'Baskerville', 'serif'],
        sans:  ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        tightest: '-0.035em',
        tighter:  '-0.025em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-violet': '0 0 24px rgba(111, 56, 232, 0.4)',
        'glow-sm-violet': '0 0 12px rgba(111, 56, 232, 0.3)',
        'inner-soft': 'inset 0 1px 2px rgba(0,0,0,0.4)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'card-enter': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.3s ease forwards',
        'slide-up':   'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'card-enter': 'card-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
