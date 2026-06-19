import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#FFFDF7',
        'surface-container-low': '#FFF9F2',
        'surface-container-highest': '#f2ecd9',
        primary: '#b71422',
        secondary: '#1a237e',
        tertiary: '#b8860b',
        accent: '#065f46',
        background: '#FFCC99',
        'on-background': '#2D2424'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Outfit', 'Inter', 'sans-serif']
      },
      spacing: {
        'grid-margin': '20px',
        'grid-gutter': '16px',
        'section-padding': '60px'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: [forms]
};
