import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://frotly.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/registro', '/esqueci-senha'],
      disallow: ['/api/', '/_next/', '/dashboard/', '/recuperar-senha'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
