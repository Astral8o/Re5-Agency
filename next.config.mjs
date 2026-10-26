/** @type {import('next').NextConfig} */
const nextConfig = {
  // The old dashboard demo was taken down; send any saved links to the homepage.
  async redirects() {
    return [{ source: "/see-ai-in-action", destination: "/", permanent: true }];
  },
};

export default nextConfig;
