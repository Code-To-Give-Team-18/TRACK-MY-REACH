import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const backendHostname = new URL(backendUrl).hostname;

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['localhost', backendHostname, 'static.wikia.nocookie.net', 'www.w3schools.com', 'via.placeholder.com'].filter((domain, index, self) => 
      self.indexOf(domain) === index
    ),
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  transpilePackages: ['three'],
};

export default nextConfig;
