/** @type {import('next').NextConfig} */
const nextConfig = {
  // The homepage is the exported RE5 Agency page, served exactly as supplied.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }] };
  },
};

export default nextConfig;
