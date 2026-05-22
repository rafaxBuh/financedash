/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#030303',
        surface: 'rgba(255, 255, 255, 0.03)',
        'surface-2': 'rgba(255, 255, 255, 0.06)',
        border: 'rgba(255, 255, 255, 0.08)',
        'text-primary': '#ffffff',
        'text-secondary': '#bbbbbb',
        'text-muted': '#888888',
        accent: '#FF5A00',
        'accent-hover': '#FF8800',
        'accent-dim': 'rgba(255, 90, 0, 0.15)',
        'accent-glow': 'rgba(255, 90, 0, 0.4)',
        success: '#00FF88',
        'success-dim': 'rgba(0, 255, 136, 0.15)',
        danger: '#FF3333',
        'danger-dim': 'rgba(255, 51, 51, 0.15)',
        warning: '#FFB800',
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) both',
        'pulse-dot': 'pulse-dot 2s infinite',
        'aurora-drift': 'aurora-drift 12s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.6)' },
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}
