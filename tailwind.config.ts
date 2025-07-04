import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#256c7c',
        secondary: '#f5f5f5',
        accent: '#ffb030',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        heading: [
          'var(--font-pt-sans)',
          'PT Sans',
          'Arial',
          'Helvetica',
          'sans-serif'
        ]
      },
    },
  },
  plugins: [],
  // Add performance optimizations
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config; 