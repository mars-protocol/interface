import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta charSet='utf-8' />
        <link href='/favicon.svg' rel='icon' />
        <link href='/apple-touch-icon.png' rel='apple-touch-icon' sizes='180x180' />
        <link href='/site.webmanifest' rel='manifest' />
        <link color='#dd5b65' href='/safari-pinned-tab.svg' rel='mask-icon' />
        <meta content='index,follow' name='robots' />
        <meta
          content="Lend, borrow and earn on the galaxy's most powerful credit protocol or enter the Fields of Mars for advanced DeFi strategies."
          name='description'
        />
        <meta content='summary_large_image' name='twitter:card' />
        <meta content='@mars_protocol' name='twitter:site' />
        <meta content='@mars_protocol' name='twitter:creator' />
        <meta content='https://app.marsprotocol.io' property='og:url' />
        <meta content='Mars Protocol - Outpost' property='og:title' />
        <meta
          content="Lend, borrow and earn on the galaxy's most powerful credit protocol or enter the Fields of Mars for advanced DeFi strategies."
          property='og:description'
        />
        <meta content='https://app.marsprotocol.io/banner.png' property='og:image' />
        <meta content='Mars Protocol' property='og:site_name' />
        <meta content='#ffffff' name='msapplication-TileColor' />
        <meta content='#ffffff' name='theme-color' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
