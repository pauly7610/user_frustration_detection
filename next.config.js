/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: false
            }
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/:path*`
            }
        ];
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
                ]
            }
        ];
    }
};

module.exports = nextConfig; 