import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

/**
 * Dirección pública del sitio, tomada automáticamente del entorno de despliegue
 * (Vercel) o de SITE_URL si se define. Se escribe en el HTML al compilar porque
 * los rastreadores de redes sociales no ejecutan JavaScript. Sin ninguna de las
 * dos queda vacía y las rutas son relativas al propio sitio. En desarrollo se
 * usa la dirección local del servidor (localhost).
 */
function sitioUrl() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const url = process.env.SITE_URL || (host ? `https://${host}` : '')
  return url.replace(/\/$/, '')
}

const urlDelSitio = {
  name: 'url-del-sitio',
  transformIndexHtml(html, ctx) {
    // En desarrollo (npm run dev) usa la dirección local del servidor, p. ej. http://localhost:5173
    const local = ctx.server
      ? (ctx.server.resolvedUrls?.local?.[0] || `http://localhost:${ctx.server.config.server.port}`).replace(/\/$/, '')
      : null
    return html.replaceAll('%SITE_URL%', local ?? sitioUrl())
  }
}

// https://vitejs.dev/config/
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
