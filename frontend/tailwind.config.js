/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        ink2: 'var(--ink2)',
        ink3: 'var(--ink3)',
        paper: 'var(--paper)',
        paper2: 'var(--paper2)',
        paper3: 'var(--paper3)',
        saffron: 'var(--saffron)',
        saffron2: 'var(--saffron2)',
        'saffron-pale': 'var(--saffron-pale)',
        green: 'var(--green)',
        'green-pale': 'var(--green-pale)',
      },
      fontFamily: {
        display: ['Instrument Serif', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
    },
  },
  plugins: [],
}
