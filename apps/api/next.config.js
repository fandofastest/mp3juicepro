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
};

module.exports = nextConfig;

