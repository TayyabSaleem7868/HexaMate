import type { NextConfig } from "next";

const nextConfig: NextConfig = {

	async headers() {
		return [

			{
				source: '/_next/static/:path*',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
				],
			},

			{
				source: '/:path*',
				headers: [
					{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
				],
			},
		];
	},
};

export default nextConfig;
