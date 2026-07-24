/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nyt: {
          paper: '#f6f6f0',
          panel: '#ffffff',
          ink: '#121212',
          sub: '#5b5b5b',
          line: '#d9d9d3',
          red: '#a8353d',
          blue: '#375d8a',
          green: '#538d4e',
          gold: '#a5822f',
          plum: '#6f5f96',
          rust: '#a3672f',
        },
      },
      fontFamily: {
        head: ['"Libre Franklin"', 'ui-sans-serif', 'system-ui'],
        body: ['"Libre Franklin"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 18, 18, 0.06), 0 1px 1px rgba(18, 18, 18, 0.04)',
        raised: '0 2px 8px rgba(18, 18, 18, 0.10)',
      },
      animation: {
        popin: 'popin 0.2s ease-out',
        shake: 'shake 0.3s ease-in-out',
      },
      keyframes: {
        popin: {
          '0%': { transform: 'scale(0.96)', opacity: 0 },
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
