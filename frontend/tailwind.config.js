/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'accent-gold': 'var(--accent-gold)',
        'accent-gold-soft': 'var(--accent-gold-soft)',
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        warm: 'var(--shadow)',
        'warm-sm': 'var(--shadow-sm)',
      },
    },
  },
  plugins: [],
};
