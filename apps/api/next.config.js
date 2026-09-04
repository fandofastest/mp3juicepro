/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["yt-search", "cheerio"],
  transpilePackages: [
    "@headless/types",
    "@headless/utils",
    "@headless/auth",
    "@headless/database",
    "@headless/providers",
  ],
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://juiceproapi.fando.id/api/:path*',
        permanent: true, // HTTP 308
      },
    ];
  },
};

module.exports = nextConfig;

