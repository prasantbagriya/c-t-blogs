import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
};

export default function AmpRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html amp="" lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        
        {/* Required AMP scripts */}
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script
          async
          custom-element="amp-story"
          src="https://cdn.ampproject.org/v0/amp-story-1.0.js"
        ></script>
        
        {/* Required AMP Boilerplate */}
        <style
          amp-boilerplate=""
          dangerouslySetInnerHTML={{
            __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`,
          }}
        />
        <noscript>
          <style
            amp-boilerplate=""
            dangerouslySetInnerHTML={{
              __html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`,
            }}
          />
        </noscript>
      </head>
      <body style={{ opacity: 0 }}>
        {children}
      </body>
    </html>
  );
}
