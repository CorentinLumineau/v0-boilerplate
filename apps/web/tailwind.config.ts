import type { Config } from 'tailwindcss'
import sharedConfig from '../../packages/config/tailwind.config.js'

const config = {
  ...sharedConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Include shared packages if needed
    '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config