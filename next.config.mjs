import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
                    {key: 'X-Content-Type-Options', value: 'nosniff'},
                    {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
                ],
            },
            {
                source: '/fonts/(.*)',
                headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}],
            },
            {
                source: '/projects/(.*)',
                headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
