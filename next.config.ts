import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  ...(isGithubActions
    ? {
        output: "export",
        trailingSlash: true,
        basePath: "/DenBooks",
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
