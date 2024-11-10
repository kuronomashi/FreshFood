/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'], 
        'custom': ['MyCustomFont', 'sans-serif'], 
        'odor': ['Odor Mean Chey', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'commissioner': ['Commissioner', 'sans-serif'],
        'montserrat': ['Montserrat Alternates', 'sans-serif'],
        'mitr': ['Mitr', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
