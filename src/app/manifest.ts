
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Motoclub VVF Roma',
    short_name: 'VVF Roma',
    description: 'Il motoclub ufficiale del Comando dei Vigili del Fuoco di Roma.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a1a',
    theme_color: '#d32f2f',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo_motoclub.gif',
        sizes: 'any',
        type: 'image/gif',
        purpose: 'any',
      },
      {
        src: '/logo_motoclub.gif',
        sizes: '192x192',
        type: 'image/gif',
        purpose: 'maskable',
      },
      {
        src: '/logo_motoclub.gif',
        sizes: '512x512',
        type: 'image/gif',
      }
    ],
  }
}
