import { MetadataRoute } from 'next'
import { getAssets } from '@/lib/assets'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://assetninja.jp'
  
  // Get all assets for dynamic routes
  const assets = await getAssets()
  const assetUrls = assets.map((asset) => ({
    url: `${baseUrl}/items/${asset.id}`,
    lastModified: new Date(asset.publishedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    // (Optional) images for Google Image Search
    images: [asset.imageUrl]
  }))

  const categories = ['food', 'medical', 'stationery', 'festival', 'items'];
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryUrls,
    {
      url: `${baseUrl}/coming-soon`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...assetUrls,
  ]
}
