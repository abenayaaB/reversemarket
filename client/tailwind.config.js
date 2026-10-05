/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 500: '#4f46e5', 600: '#4338ca', 700: '#3730a3', 900: '#1e1b4b' },
        canvas: '#f7f8fc',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        floatSoft: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-7px)' } },
      },
      animation: { fadeUp: 'fadeUp .45s ease-out both', slideIn: 'slideIn .25s ease-out both', floatSoft: 'floatSoft 4s ease-in-out infinite' },
    },
  },
  plugins: [],
}
