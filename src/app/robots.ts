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
        userAgent: ['ChatGPT-User', 'Google-Extended', 'Claude-Web', 'PerplexityBot', 'OAI-SearchBot'],
        allow: ['/'],
      }
    ],
    sitemap: 'https://assetninja.jp/sitemap.xml',
  }
}
