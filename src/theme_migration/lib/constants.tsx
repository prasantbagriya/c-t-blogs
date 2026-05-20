import { Palette, Target, Camera, BarChart3, Megaphone, Globe, Zap, Code, Shield, Clock, MessageSquare, Smartphone, Search, ImageIcon, MessageCircle, TrendingUp } from "lucide-react";
import React from 'react';

export const BRANDS = [
  "Meta", "WhatsApp Business", "Shopify", "HubSpot", "Salesforce", "Zapier", "Google Analytics", "Stripe", "Twilio", "Mailchimp", "Slack", "Notion"
];

export const SERVICES = [
  {
    id: "whatsapp-business-api",
    title: "Official WhatsApp Business API",
    description: "Scale your customer engagement with the official Meta Cloud API. Send mass broadcasts and automate support with verified business status.",
    icon: <MessageSquare className="w-8 h-8" />,
    features: ["Verified Business Status", "Mass Broadcasting", "API Infrastructure"],
    color: "indigo"
  },
  {
    id: "ai-chatbot-automation",
    title: "AI Chatbot Automation",
    description: "Build intelligent AI chatbots and no-code automation flows to handle customer queries 24/7 on WhatsApp and Instagram.",
    icon: <Zap className="w-8 h-8" />,
    features: ["No-code AI Builder", "NLP Technology", "CRM Integration"],
    color: "purple"
  },
  {
    id: "omnichannel-marketing",
    title: "Omnichannel Marketing Hub",
    description: "Manage all your messaging channels—WhatsApp, Instagram, and Facebook—from one unified dashboard for seamless lead conversion.",
    icon: <Globe className="w-8 h-8" />,
    features: ["Unified Shared Inbox", "Smart Team Routing", "Multi-platform Sync"],
    color: "blue"
  },
  {
    id: "meta-verified-campaigns",
    title: "Meta-Verified Campaigns",
    description: "Run high-converting WhatsApp marketing campaigns with official templates and real-time ROI tracking analytics.",
    icon: <TrendingUp className="w-8 h-8" />,
    features: ["ROI Tracking", "Approved Templates", "Conversion Insights"],
    color: "green"
  }
];

export const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO, Elevate Fitness",
    avatar: "SJ",
    quote: "ChatWizs transformed our brand from just another local gym to a recognized fitness authority. Their marketing strategy helped us connect with our ideal audience.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60"
  },
  {
    name: "Marcus Webb",
    role: "Recording Artist, Lunar Beats",
    avatar: "MW",
    quote: "Before working with ChatWizs, I was just another artist lost in the noise. Their team understood exactly what made my sound unique and how to get it in front of the right listeners.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60"
  },
  {
    name: "David Chen",
    role: "Principal Broker, Coastal Properties",
    avatar: "DC",
    quote: "ChatWizs understood the luxury real estate market and helped us communicate our value proposition effectively. Their strategies have directly contributed to our most successful year.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60"
  }
];

export const SUCCESS_STORIES = [
  {
    name: "Elevate Fitness",
    industry: "Health & Fitness",
    logo: "/placeholder.svg?height=80&width=80",
    image: "/placeholder.svg?height=600&width=800",
    challenge: "Struggling to stand out in a crowded fitness market with limited brand recognition and inconsistent marketing.",
    solution: "Comprehensive brand refresh, targeted social media campaigns, and email marketing strategy focused on customer success stories.",
    results: [
      "300% increase in membership sign-ups",
      "5x social media engagement",
      "Featured in Men's Health magazine",
    ],
    testimonial: "ChatWizs transformed our brand from just another local gym to a recognized fitness authority. Their marketing strategy helped us connect with our ideal audience.",
    person: {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "/placeholder.svg?height=60&width=60",
    },
  },
  {
    name: "Lunar Beats",
    industry: "Music Production",
    logo: "/placeholder.svg?height=80&width=80",
    image: "/placeholder.svg?height=600&width=800",
    challenge: "Independent artist struggling to gain traction on streaming platforms and build a sustainable fan base.",
    solution: "Artist development strategy, playlist pitching campaign, content calendar, and targeted advertising to core demographics.",
    results: ["1.2M+ Spotify streams in 6 months", "Featured on 5 editorial playlists", "Sold-out first headline show"],
    testimonial: "Before working with ChatWizs, I was just another artist lost in the noise. Their team understood exactly what made my sound unique.",
    person: {
      name: "Marcus Webb",
      role: "Recording Artist",
      image: "/placeholder.svg?height=60&width=60",
    },
  }
];

export const FAQS = [
  {
    q: "How can I get the WhatsApp Green Tick?",
    a: "We assist businesses in applying for the Meta Official Business Account (OBA) badge. We guide you through the verification requirements to help you gain trusted brand status."
  },
  {
    q: "Is ChatWizs an Official Meta Partner?",
    a: "Yes, our platform is built on the official WhatsApp Cloud API from Meta. This ensures 100% compliance with messaging policies and provides the highest level of security."
  },
  {
    q: "Does it support AI Chatbots on WhatsApp?",
    a: "Absolutely. You can build intelligent, AI-powered automation flows that qualify leads, handle support, and close sales automatically without any coding knowledge."
  },
  {
    q: "What are the costs for WhatsApp API?",
    a: "Pricing consists of a platform fee and Meta's conversation-based charges. We offer transparent pricing to help you scale your marketing budget effectively."
  }
];

export const STEPS = [
  { 
    number: "01",
    title: "WhatsApp API Onboarding",
    description: "Get started with the official WhatsApp Business API. We manage the Meta verification process for your business account.",
    icon: "Search",
    mockup: "discovery",
    accent: "text-blue-400"
  },
  { 
    number: "02",
    title: "AI Automation Design",
    description: "Design and deploy custom AI chatbots and automated flows tailored to your business conversion goals.",
    icon: "Lightbulb",
    mockup: "development",
    accent: "text-purple-400"
  },
  { 
    number: "03",
    title: "Marketing Scale & ROI",
    description: "Launch your campaigns and monitor real-time ROI with our advanced analytics and tracking dashboard.",
    icon: "Rocket",
    mockup: "launch",
    accent: "text-green-400"
  },
];
