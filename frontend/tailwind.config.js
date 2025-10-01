/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg': '#0B1020',
        'bg-2': '#0f1724',
        'primary-from': '#7C3AED',
        'primary-to': '#06B6D4',
        'accent': '#FB7185',
        'neon': '#00F5A0',
        'warm': '#F59E0B',
        'text': '#E6EEF8',
        'muted': '#9AA6B2',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00F5A0 0%, #06B6D4 100%)',
        'warm-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FB7185 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px #00F5A0' },
          'to': { boxShadow: '0 0 30px #00F5A0, 0 0 40px #00F5A0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};