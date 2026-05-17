import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/_next/image', '/_next/static'],
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://ai-asset-platform.vercel.app/sitemap.xml',
  }
}
