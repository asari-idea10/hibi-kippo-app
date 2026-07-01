import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./src/data/calendar-master/by-year/**/*.json"],
  },
};

export default nextConfig;
