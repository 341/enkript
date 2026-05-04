/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './lib/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A0F1E',
          900: '#0D1426',
          800: '#131D35',
          700: '#1B2847',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        mono: ['JetBrainsMono_400Regular'],
        display: ['Inter_700Bold'],
        heading: ['Inter_600SemiBold'],
        subhead: ['Inter_500Medium'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.4)',
        modal: '0 8px 32px rgba(0,0,0,0.7)',
        fab: '0 4px 16px rgba(99,102,241,0.4)',
      },
    },
  },
  plugins: [],
};
