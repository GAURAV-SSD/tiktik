/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#5A67D8', // Main primary color
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Accent/hope color (green)
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#48BB78', // Main accent color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Background colors
        background: {
          light: '#F7FAFC',
          dark: '#1A202C',
        },
        // Mood-based colors
        mood: {
          happy: {
            from: '#667eea',
            to: '#764ba2',
          },
          neutral: {
            bg: '#f8f9fa',
            text: '#6c757d',
          },
          sad: {
            bg: '#e3f2fd',
            text: '#1976d2',
          },
          anxious: {
            bg: '#e8f5e8',
            text: '#2e7d32',
          },
        },
        // Semantic colors
        success: '#48BB78',
        warning: '#ED8936',
        error: '#F56565',
        info: '#4299E1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'mood-happy': '0 10px 25px -5px rgba(102, 126, 234, 0.25)',
        'mood-sad': '0 10px 25px -5px rgba(25, 118, 210, 0.25)',
        'mood-anxious': '0 10px 25px -5px rgba(46, 125, 50, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}