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
    },
  },
  plugins: [],
  // Add performance optimizations
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config; 