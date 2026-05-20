import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://chatwizs.com';

export const metadata: Metadata = {
  title: 'Editorial Policy & Content Integrity Guidelines | ChatWizs',
  description: 'Understand ChatWizs editorial guidelines. Discover how we enforce rigorous accuracy standards, author E-E-A-T credentials, and editorial transparency for modern technology and SEO insights.',
  alternates: { canonical: `${BASE_URL}/editorial-policy` },
  robots: { index: true, follow: true },
};

export default function EditorialPolicyPage() {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page">Editorial Policy</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.05em' }}>Editorial Policy</h1>
      
      <div className="post-content" style={{ fontSize: '1.25rem', lineHeight: 1.8 }}>
        <p>At ChatWizs, our mission is to provide accurate, unbiased, and expert-verified information to our readers. Our editorial process is designed to ensure that every piece of content we publish meets the highest standards of integrity and usefulness.</p>
        
        <h2>1. Accuracy and Verification</h2>
        <p>Every article published on ChatWizs undergoes a rigorous verification process. Our writers are experts in their respective fields, and their work is reviewed by our editorial team to ensure factual accuracy and technical depth.</p>
        
        <h2>2. Independence and Impartiality</h2>
        <p>Our editorial content is created independently. We do not accept payment in exchange for positive reviews or biased reporting. Any sponsored content is clearly labeled as such to maintain transparency with our audience.</p>
        
        <h2>3. Transparency and Accountability</h2>
        <p>We believe in being accountable for the information we share. If an error is discovered in one of our articles, we commit to correcting it promptly and transparently.</p>
        
        <h2>4. Human-First Content</h2>
        <p>While we leverage modern technology for research and optimization, all our final content is written, reviewed, and approved by human experts. We prioritize the needs of our readers over search engine algorithms.</p>
      </div>
    </div>
  );
}
