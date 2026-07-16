import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const DEFAULT_SITE_URL = 'https://lyricpost.vercel.app'

function siteUrlHtmlPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, '')
  return {
    name: 'lyricpost-site-url',
    transformIndexHtml(html) {
      return html
        .replaceAll('%VITE_SITE_URL%', base)
        .replaceAll('__SITE_URL__', base)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss(), siteUrlHtmlPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
