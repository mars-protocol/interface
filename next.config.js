/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')
const path = require('path')

const moduleExports = {
  reactStrictMode: true,
  experimental: { images: { unoptimized: true } },
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/redbank',
        permanent: true,
      },
      {
        source: '/farm/vault/:address/create',
        destination: '/farm/',
        permanent: true,
      },
      {
        source: '/farm/vault/:address/create/setup',
        destination: '/farm/',
        permanent: true,
      },
      {
        source: '/farm/vault/:address/edit',
        destination: '/farm/',
        permanent: true,
      },
      {
        source: '/farm/vault/:address/unlock',
        destination: '/farm',
        permanent: true,
      },
      {
        source: '/farm/vault/:address/close',
        destination: '/farm',
        permanent: true,
      },
      {
        source: '/farm/vault/:address/repay',
        destination: '/farm',
        permanent: true,
      },
    ]
  },
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions)
