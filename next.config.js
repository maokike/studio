// studio/next.config.js
console.log('Valor de NODE_TLS_REJECT_UNAUTHORIZED al iniciar Next.js:', process.env.NODE_TLS_REJECT_UNAUTHORIZED);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Elimina la sección async rewrites()
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'https://localhost:44314/api/:path*',
  //     },
  //   ];
  // },
};

module.exports = nextConfig;