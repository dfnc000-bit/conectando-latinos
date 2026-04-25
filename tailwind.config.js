/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cl-verde':      '#1a8a6e',
        'cl-verde2':     '#22b08c',
        'cl-dorado':     '#c8882a',
        'cl-dorado2':    '#e8a84a',
        'cl-gold':       '#c8882a',
        'cl-gold2':      '#e8a84a',
        'cl-dark':       '#141814',
        'cl-gray':       '#5a6057',
        'cl-gray-light': '#dde0d8',
        'cl-bg':         '#f4f5f0',
        'cl-bg2':        '#eceee8',
      },
      fontFamily: {
        syne:    ['var(--font-syne)', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [],
}
