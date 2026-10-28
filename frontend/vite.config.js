import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

function sitioUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const url = process.env.SITE_URL || (host ? `https://${host}` : '')
  return url.replace(/\/$/, '')
}

const urlDelSitio = {
  name: 'url-del-sitio',
  transformIndexHtml(html, ctx) {
    const local = ctx.server
      ? (ctx.server.resolvedUrls?.local?.[0] || `http://localhost:${ctx.server.config.server.port}`).replace(/\/$/, '')
      : null
    return html.replaceAll('%SITE_URL%', local ?? sitioUrl())
  }
}

export default defineConfig({
  plugins: [svelte(), urlDelSitio],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
    strictPort: false
  },
  preview: {
    port: 4173
  }
})
