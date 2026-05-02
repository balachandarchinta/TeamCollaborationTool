import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Proxy all /api requests to the backend on port 3001 */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
