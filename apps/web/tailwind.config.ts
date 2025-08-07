import type { Config } from 'tailwindcss'
import sharedConfig from '../../packages/config/tailwind.config.js'

const config = {
  ...sharedConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Include UI package components (only tsx files for performance)
    '../../packages/ui/src/**/*.{jsx,tsx}',
  ],
}

export default config