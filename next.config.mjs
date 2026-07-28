/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://bist-terminal-hds9.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
