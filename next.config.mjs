/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Add the WordPress domain when media URLs are available
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'turismocultural.com.ar',
        pathname: '/wp-content/**',
      },
    ],
    // Local images (public/) are served directly
    unoptimized: false,
  },
};

export default nextConfig;
