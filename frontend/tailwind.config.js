/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sky Teal — primary brand
        brand: {
          50: '#e7f7fb',
          100: '#c3ecf6',
          200: '#84d3ec',
          300: '#44b9e2',
          400: '#17a6d9',
          500: '#3AACCA',  // primary teal
          600: '#1a8fab',
          700: '#157289',
          800: '#105869',
          900: '#0c4252',
        },
        // Coral — CTA, AI buttons
        coral: {
          DEFAULT: '#E86C4A',
          50:  '#fdf0ec',
          100: '#fad7cc',
          200: '#f5af9a',
          300: '#ef8368',
          400: '#ea7257',
          500: '#E86C4A',
          600: '#c85535',
          700: '#a04329',
          800: '#7a321e',
          900: '#5a2316',
        },
        // Surfaces
        surface: {
          DEFAULT: '#FFFFFF',   // white cards
          dark: '#EBF8FC',      // page background (light sky)
          light: '#F4FBFD',     // subtle tint
          lighter: '#D8EEF5',   // border/divider tint
          navy: '#1C3A5C',      // sidebar / dark nav
        },
        // Navy text scale
        navy: {
          50:  '#e8f0f8',
          100: '#c5d5e8',
          200: '#9db7d6',
          300: '#7498c2',
          400: '#5580b3',
          500: '#3668a4',
          600: '#2a5080',
          700: '#1f3d62',
          800: '#1C3A5C',
          900: '#132840',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #3AACCA 0%, #1a8fab 100%)',
        'gradient-coral':  'linear-gradient(135deg, #E86C4A 0%, #c85535 100%)',
        'gradient-sky':    'linear-gradient(180deg, #EBF8FC 0%, #FFFFFF 100%)',
        'gradient-navy':   'linear-gradient(135deg, #1C3A5C 0%, #0c4252 100%)',
        'gradient-glass':  'linear-gradient(135deg, rgba(58,172,202,0.08) 0%, rgba(26,143,171,0.04) 100%)',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(58, 172, 202, 0.25)',
        'glow-sm':    '0 0 10px rgba(58, 172, 202, 0.15)',
        'coral-glow': '0 0 20px rgba(232, 108, 74, 0.3)',
        'card':       '0 2px 12px rgba(28, 58, 92, 0.08)',
        'card-hover': '0 6px 28px rgba(28, 58, 92, 0.14)',
        'panel':      '0 1px 4px rgba(28, 58, 92, 0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
