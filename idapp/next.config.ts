/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ This prevents Vercel from blocking the deployment on ESLint errors
  },
};

module.exports = nextConfig;
