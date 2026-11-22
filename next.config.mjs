/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGithubActions ? "/bid_table" : "";

const nextConfig = {
  output: "export",
  basePath: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
