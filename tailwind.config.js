/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arcade: {
          bg: '#1c1230',
          panel: '#2a1f47',
          pink: '#f472b6',
          cyan: '#67e8f9',
          yellow: '#fde047',
          lime: '#a3e635',
          purple: '#c084fc',
          orange: '#fb923c',
        },
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
        display: ['"Baloo 2"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        neon: '0 0 4px currentColor, 0 0 10px currentColor',
        'neon-lg': '0 0 6px currentColor, 0 0 16px currentColor',
      },
      animation: {
        flicker: 'flicker 2.5s infinite',
        popin: 'popin 0.25s ease-out',
        shake: 'shake 0.3s ease-in-out',
      },
      keyframes: {
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: 1 },
          '20%, 22%, 24%, 55%': { opacity: 0.6 },
        },
        popin: {
          '0%': { transform: 'scale(0.85)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
      },
    },
  },
  plugins: [],
}
