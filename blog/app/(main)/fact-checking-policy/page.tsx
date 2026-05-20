import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://chatwizs.com';

export const metadata: Metadata = {
  title: 'Fact-Checking Policy & Accuracy Standards | ChatWizs',
  description: 'Understand the ChatWizs commitment to accurate, peer-reviewed technology and SEO news. Read our guidelines on primary source verification, editorial crosscheck, and rapid correction policies.',
  alternates: { canonical: `${BASE_URL}/fact-checking-policy` },
  robots: { index: true, follow: true },
};

export default function FactCheckingPolicyPage() {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page">Fact-Checking Policy</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.05em' }}>Fact-Checking Policy</h1>
      
      <div className="post-content" style={{ fontSize: '1.25rem', lineHeight: 1.8 }}>
        <p>ChatWizs is committed to accuracy in all its reporting. Our fact-checking policy is the backbone of our commitment to our readers. We strive to present facts in their correct context and verify all data points before publication.</p>
        
        <h2>1. Primary Source Verification</h2>
        <p>Our writers are required to verify information against primary sources whenever possible. This includes official government reports, academic journals, and direct statements from verified organizations.</p>
        
        <h2>2. Data Accuracy</h2>
        <p>All statistical data and numerical claims are double-checked for accuracy. We cite our sources clearly within our articles to allow readers to verify the information themselves.</p>
        
        <h2>3. Review by Subject Matter Experts</h2>
        <p>Content involving technical, financial, or legal topics is reviewed by subject matter experts to ensure that the nuances of the information are correctly conveyed.</p>
        
        <h2>4. Corrections and Updates</h2>
        <p>In the event of an error, we act quickly to correct the information and provide a note explaining the change. We also regularly update our evergreen content to ensure it remains accurate as new information becomes available.</p>
      </div>
    </div>
  );
}
