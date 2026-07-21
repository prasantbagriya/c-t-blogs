import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
 title: string;
 description: string;
 canonicalUrl?: string;
 structuredData?: Record<string, any> | Record<string, any>[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
 title, 
 description, 
 canonicalUrl, 
 structuredData 
}) => {
 return (
 <Helmet>
 <title>{title}</title>
 <meta name="description" content={description} />
 
 {/* Open Graph / Social */}
 <meta property="og:title" content={title} />
 <meta property="og:description" content={description} />
 {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
 <meta property="og:type" content="website" />
 <meta property="og:image" content="https://chatwizs.com/og-image.png" />
 <meta property="og:image:alt" content="ChatWizs — AI-Powered WhatsApp Automation Platform" />

 {/* Twitter */}
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content={title} />
 <meta name="twitter:description" content={description} />
 <meta name="twitter:image" content="https://chatwizs.com/og-image.png" />
 <meta name="twitter:image:alt" content="ChatWizs — AI-Powered WhatsApp Automation Platform" />
 <meta name="twitter:site" content="@chatwizs" />
 <meta name="twitter:creator" content="@chatwizs" />

 {/* Canonical Link */}
 {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

 {/* Structured Data (JSON-LD) for AEO/GEO */}
 {structuredData && (
 <script type="application/ld+json">
 {JSON.stringify(structuredData)}
 </script>
 )}
 </Helmet>
 );
};
