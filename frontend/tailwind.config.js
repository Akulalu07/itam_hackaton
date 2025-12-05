/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'swipe-right': 'swipeRight 0.3s ease-out',
        'swipe-left': 'swipeLeft 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateX(150%) rotate(30deg)', opacity: 0 },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateX(-150%) rotate(-30deg)', opacity: 0 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        itamhack: {
          "primary": "#6419E6",          // Vibrant purple
          "primary-content": "#ffffff",
          "secondary": "#D926A9",         // Pink accent
          "secondary-content": "#ffffff",
          "accent": "#1FB2A6",            // Teal
          "accent-content": "#ffffff",
          "neutral": "#2A323C",           // Dark gray
          "neutral-content": "#A6ADBB",
          "base-100": "#1D232A",          // Dark background
          "base-200": "#191E24",          // Darker
          "base-300": "#15191E",          // Darkest
          "base-content": "#A6ADBB",      // Light text
          "info": "#3ABFF8",
          "info-content": "#002B3D",
          "success": "#36D399",
          "success-content": "#003320",
          "warning": "#FBBD23",
          "warning-content": "#382800",
          "error": "#F87272",
          "error-content": "#470000",
        },
        itamlight: {
          "primary": "#6419E6",
          "primary-content": "#ffffff",
          "secondary": "#D926A9",
          "secondary-content": "#ffffff",
          "accent": "#1FB2A6",
          "accent-content": "#ffffff",
          "neutral": "#3D4451",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#F2F2F2",
          "base-300": "#E5E6E6",
          "base-content": "#1F2937",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
    darkTheme: "itamhack",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}
