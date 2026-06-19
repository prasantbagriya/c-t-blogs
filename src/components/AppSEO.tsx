import React, { useMemo } from 'react';
import { SEOHead } from './SEOHead';

interface AppSEOProps {
  currentPage: string;
  activeTab?: string;
}

export const AppSEO: React.FC<AppSEOProps> = ({ currentPage, activeTab }) => {
  const { title, description, canonicalUrl, structuredData } = useMemo(() => {
    let title = "ChatWizs | AI-Powered WhatsApp Automation Platform";
    let description = "Empower your business with ChatWizs. The ultimate AI-powered WhatsApp automation platform for marketing, lead generation, and customer support.";
    let canonicalUrl = "https://chatwizs.com/";

    const pageTitles: Record<string, string> = {
      landing: "ChatWizs | Advanced WhatsApp Marketing & AI Automation",
      services: "Our Services | WhatsApp Business API & AI Solutions - ChatWizs",
      'service-detail': `Service Detail | WhatsApp Automation - ChatWizs`,
      'whatsapp-link-generator': "WhatsApp Link & QR Generator | Free Marketing Tools - ChatWizs",
      about: "About Us | Our Story & Vision - ChatWizs",
      contact: "Contact Us | Get Started with WhatsApp API - ChatWizs",
      privacy: "Privacy Policy | ChatWizs Data Protection",
      terms: "Terms of Service | ChatWizs Platform Usage",
      auth: "Login & Sign Up | Access ChatWizs Dashboard",
      dashboard: "Dashboard | Manage Your WhatsApp Campaigns - ChatWizs",
      'sip-calculator': "SIP Calculator | Plan Your Mutual Fund Investment - ChatWizs",
      'compound-interest': "Compound Interest Calculator | Free Financial Tool - ChatWizs",
      'prop-firm': "Prop Firm Calculator | Trading Tool - ChatWizs",
      'youtubevideodownload': "YouTube Video Downloader Free Online – Download MP4 & MP3 | ChatWizs",
    };

    const pageDescriptions: Record<string, string> = {
      landing: "Scale your business with AI-powered WhatsApp automation. Send bulk messages, automate responses, and convert leads with ChatWizs platform.",
      services: "Explore ChatWizs WhatsApp Business API services — bulk messaging, chatbot automation, lead generation, and Meta Business Partner solutions.",
      about: "Learn about ChatWizs — India's leading AI-powered WhatsApp marketing platform trusted by thousands of businesses.",
      contact: "Get in touch with ChatWizs team. Start your WhatsApp Business API integration today and grow your business.",
      privacy: "Read ChatWizs privacy policy. We are committed to protecting your data and ensuring full GDPR & IT Act compliance.",
      terms: "ChatWizs terms of service — understand your rights and responsibilities while using our platform.",
      auth: "Login or sign up to ChatWizs dashboard. Access your WhatsApp campaigns, contacts, and AI automation tools.",
      'youtubevideodownload': "Download YouTube videos free in MP4 & MP3. Fast online YouTube downloader – no software needed. Supports 4K, 1080p, 720p & Shorts.",
      'sip-calculator': "Calculate your SIP returns with our free mutual fund SIP calculator. Plan investments for wealth creation with ChatWizs.",
      'compound-interest': "Calculate compound interest easily with our free online tool. See how your money grows over time.",
    };

    const pageUrls: Record<string, string> = {
      landing: "https://chatwizs.com/",
      services: "https://chatwizs.com/services",
      about: "https://chatwizs.com/about-us",
      contact: "https://chatwizs.com/contact-us",
      privacy: "https://chatwizs.com/privacy-policy",
      terms: "https://chatwizs.com/terms-of-service",
      'auth': "https://chatwizs.com/get-started",
      'youtubevideodownload': "https://chatwizs.com/youtubevideodownload",
      'sip-calculator': "https://chatwizs.com/tool/sip-calculator",
      'compound-interest': "https://chatwizs.com/tool/compound-interest",
      'prop-firm': "https://chatwizs.com/tool/prop-firm",
    };

    const tabTitles: Record<string, string> = {
      overview: "Overview | Marketing Performance Dashboard",
      accounts: "Accounts | Manage WhatsApp & Instagram API",
      whatsapp: "WhatsApp | Official Meta Messaging & Broadcasts",
      instagram: "Instagram | DM Automation & AI Responses",
      inbox: "Unified Inbox | Omnichannel Customer Support",
      flows: "Flow Builder | No-Code AI Automation Sequences",
      ads: "Ads Manager | Click-to-WhatsApp Advertising",
      contacts: "Contacts | Audience Management & Segments",
      agent: "AI Training | Train Your Business Assistant",
      leads: "Leads Hub | Convert Conversations into Sales",
      settings: "Settings | Platform Configuration & Security"
    };

    if (currentPage === 'dashboard') {
      title = tabTitles[activeTab || 'overview'] || pageTitles[currentPage];
      canonicalUrl = "https://chatwizs.com/dashboard";
    } else {
      title = pageTitles[currentPage] || title;
      description = pageDescriptions[currentPage] || description;
      canonicalUrl = pageUrls[currentPage] || canonicalUrl;
    }

    // Generate JSON-LD Structured Data based on the page
    let structuredData: any = null;

    if (currentPage === 'landing') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "ChatWizs",
        "url": "https://chatwizs.com",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": description,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
      };
    } else if (['sip-calculator', 'compound-interest', 'prop-firm', 'youtubevideodownload', 'whatsapp-link-generator'].includes(currentPage)) {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": title.split('|')[0].trim(),
        "applicationCategory": "WebApplication",
        "operatingSystem": "Any",
        "description": description,
        "url": canonicalUrl
      };
    } else if (currentPage === 'services') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "WhatsApp Business API & AI Automation",
        "provider": {
          "@type": "Organization",
          "name": "ChatWizs"
        },
        "description": description
      };
    }

    return { title, description, canonicalUrl, structuredData };
  }, [currentPage, activeTab]);

  return (
    <SEOHead 
      title={title} 
      description={description} 
      canonicalUrl={canonicalUrl} 
      structuredData={structuredData} 
    />
  );
};
