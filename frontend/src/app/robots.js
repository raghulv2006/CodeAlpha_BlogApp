const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://botblogs.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/write', '/profile', '/notifications'],
      },
    ],
    sitemap: `${CLIENT_URL}/sitemap.xml`,
  };
}
