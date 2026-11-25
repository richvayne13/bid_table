/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/selfbuyer" : "";

const nextConfig = {
  output: "export",
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
