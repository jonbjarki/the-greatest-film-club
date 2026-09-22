import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel Services routing doesn't reach the /_next/image function; TMDB already serves pre-sized images.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  }
};

export default nextConfig;
