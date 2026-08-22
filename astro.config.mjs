import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'

import viteInjectOcarinaTab from './src/lib/vite-inject-ocarina-tab'

export default defineConfig({
  site: 'https://mayconblopes.github.io',
  base: '/lmay-ocarina-library',

  integrations: [react(), mdx()],

  vite: {
    plugins: [viteInjectOcarinaTab(), tailwindcss()],

    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
})
