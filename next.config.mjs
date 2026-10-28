/** @type {import('next').NextConfig} */
const nextConfig = {
  // Demo pages that were taken down; send any saved links (and printed QR codes) to the homepage.
  async redirects() {
    return [
      { source: "/see-ai-in-action", destination: "/", permanent: true },
      { source: "/digital/demo", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
