/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		styledComponents: true,
	},
	env: {
		DHL_API_KEY: "apN4bX8dY6wX7u",
		DHL_API_SECRET: "T$1sJ$2uG@4aU^8m",
		NEXT_PUBLIC_SENTRY_DSN: "your_sentry_dsn_here",
		DHL_ACCOUNT_NUMBER: "239864518",
		DHL_USE_PRODUCTION: "false",
	}
};

module.exports = nextConfig;
