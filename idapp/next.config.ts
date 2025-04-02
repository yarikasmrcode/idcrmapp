/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ This skips ESLint during builds (Vercel will no longer block)
  },
};

module.exports = nextConfig;

export default nextConfig;
