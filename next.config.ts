import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // common avatar/image hosts used in demo/mock data
            { protocol: "https", hostname: "robohash.org", pathname: "/**" },
            { protocol: "https", hostname: "vercel\.app", pathname: "/**" },
            // Google profile photos
            { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
            { protocol: "https", hostname: "googleusercontent.com", pathname: "/**" },
            // allow any https host on localhost-like dev domains (optional)
            { protocol: "https", hostname: "*", pathname: "/**" },
        ],
    },
};

export default nextConfig;
