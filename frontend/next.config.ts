import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy API calls through Next to avoid CORS in dev.
    // Client should call `/api/v1/...` and this rewrite forwards it.
    const backend =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://192.168.11.12:8080/api/v1";

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
