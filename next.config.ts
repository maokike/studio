import type {NextConfig} from 'next';

const nextConfig = {
  allowedDevOrigins: [
    "https://3000-firebase-studio-1748797728180.cluster-hf4yr35cmnbd4vhbxvfvc6cp5q.cloudworkstations.dev"
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
