import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/_next/image', '/_next/static'],
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Google-Extended', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Bingbot'],
        allow: ['/'],
      }
    ],
    sitemap: 'https://assetninja.jp/sitemap.xml',
  }
}
