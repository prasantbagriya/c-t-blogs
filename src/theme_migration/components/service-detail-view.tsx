"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckCircle, Zap, BarChart3, Globe, Code, Target, MessageSquare } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"
import AnimatedFooter from "./animated-footer"
import Navbar from "./navbar"

const serviceDetails: Record<string, any> = {
  "whatsapp-business-api": {
    title: "Official WhatsApp Business API",
    description: "Scale customer engagement with the official Meta Cloud API, verified business setup, compliant templates, and high-volume messaging infrastructure.",
    icon: <MessageSquare className="w-12 h-12" />,
    features: ["Verified Business Setup", "Template Campaigns", "Cloud API Infrastructure", "Delivery Analytics"],
    stats: [
      { label: "Delivery Rate", value: "99.9%" },
      { label: "Open Rate", value: "90%+" },
      { label: "Compliance", value: "Meta API" }
    ]
  },
  "ai-chatbot-automation": {
    title: "AI Chatbot Automation",
    description: "Build intelligent automation flows for WhatsApp, Instagram, and web leads so support, qualification, and follow-ups run around the clock.",
    icon: <Zap className="w-12 h-12" />,
    features: ["No-code AI Builder", "Lead Qualification", "Human Handoff", "CRM Sync"],
    stats: [
      { label: "Response Time", value: "< 1s" },
      { label: "Support Load Cut", value: "65%" },
      { label: "Lead Lift", value: "40%" }
    ]
  },
  "omnichannel-marketing": {
    title: "Omnichannel Marketing Hub",
    description: "Unify WhatsApp, Instagram, Facebook, and website conversations in one team dashboard with routing, notes, and follow-up workflows.",
    icon: <Globe className="w-12 h-12" />,
    features: ["Unified Inbox", "Team Assignment", "Conversation Notes", "Multi-platform Sync"],
    stats: [
      { label: "Channels", value: "4+" },
      { label: "Team Speed", value: "2x" },
      { label: "Lead Capture", value: "24/7" }
    ]
  },
  "meta-verified-campaigns": {
    title: "Meta-Verified Campaigns",
    description: "Launch approved WhatsApp and Meta campaigns with ROI tracking, template governance, and conversion-focused follow-up automation.",
    icon: <Target className="w-12 h-12" />,
    features: ["Approved Templates", "Ad-to-Chat Tracking", "Conversion Insights", "Retargeting Flows"],
    stats: [
      { label: "CPA Reduction", value: "20%" },
      { label: "Conversion Lift", value: "35%" },
      { label: "Attribution", value: "Direct" }
    ]
  },
  "bulk-whatsapp-campaigns": {
    title: "Bulk WhatsApp Campaigns",
    description: "Reach thousands of customers instantly with personalized, targeted broadcast campaigns using the Meta Cloud API.",
    icon: <Zap className="w-12 h-12" />,
    features: ["Personalized Variable Injection", "Scheduled Broadcasting", "Real-time Analytics", "Anti-ban Compliance"],
    stats: [
      { label: "Delivery Rate", value: "99.9%" },
      { label: "Open Rate", value: "90%+" },
      { label: "Avg. ROI", value: "12x" }
    ]
  },
  "ai-flow-builders": {
    title: "AI Flow Builders",
    description: "Build complex conversational agents without writing a single line of code. Automate customer support and sales 24/7.",
    icon: <BarChart3 className="w-12 h-12" />,
    features: ["Drag-and-Drop Editor", "NLP Integration", "Template Library", "CRM Sync"],
    stats: [
      { label: "Support Vol. Reduction", value: "65%" },
      { label: "Lead Gen Increase", value: "40%" },
      { label: "Response Time", value: "< 1s" }
    ]
  },
  "omnichannel-inbox": {
    title: "Omnichannel Inbox",
    description: "A single unified workspace for your entire team to manage WhatsApp, Instagram, and Facebook DMs.",
    icon: <Globe className="w-12 h-12" />,
    features: ["Team Collaboration", "Message Assignment", "Private Notes", "Shared Contact Database"],
    stats: [
      { label: "Efficiency Boost", value: "50%" },
      { label: "Team Size Supported", value: "Unlimited" },
      { label: "CSAT Score", value: "4.9/5" }
    ]
  },
  "api-integrations": {
    title: "API Integrations",
    description: "Seamlessly connect ChatWizs with your existing tech stack including Shopify, WooCommerce, and custom CRMs.",
    icon: <Code className="w-12 h-12" />,
    features: ["RESTful API Access", "Webhook Support", "Pre-built Connectors", "Enterprise Security"],
    stats: [
      { label: "Integration Time", value: "Minutes" },
      { label: "Data Accuracy", value: "100%" },
      { label: "API Uptime", value: "99.99%" }
    ]
  },
  "enterprise-security": {
    title: "Enterprise Security",
    description: "Military-grade encryption and compliance measures across all communication channels for absolute peace of mind.",
    icon: <Zap className="w-12 h-12" />, // Use similar icon
    features: ["2FA Authentication", "End-to-End Encryption", "SOC2 Compliance", "Data Sovereignty"],
    stats: [
      { label: "Encryption", value: "AES-256" },
      { label: "SLA Guarantee", value: "99.99%" },
      { label: "Security Audits", value: "Quarterly" }
    ]
  },
  "delivery-automation": {
    title: "Delivery Automation",
    description: "Automated delivery tracking and order updates for e-commerce stores via WhatsApp notifications.",
    icon: <Code className="w-12 h-12" />, // Use similar icon
    features: ["Order Manifest Sync", "Automated Tracking", "Status Notifications", "Real-time Alerts"],
    stats: [
      { label: "Tracking Accuracy", value: "100%" },
      { label: "Customer Happiness", value: "95%+" },
      { label: "Update Speed", value: "< 5m" }
    ]
  },
  "click-to-whatsapp-ads": {
    title: "Click-To-WhatsApp Ads",
    description: "Convert Meta ad spend directly into WhatsApp conversations. Capture high-intent leads instantly.",
    icon: <Target className="w-12 h-12" />,
    features: ["Ad-to-Chat Attribution", "Automated Lead Qualification", "Custom Welcome Messages", "Native Meta Integration"],
    stats: [
      { label: "Conv. Rate Lift", value: "35%" },
      { label: "Lead Quality", value: "High" },
      { label: "CPA Reduction", value: "20%" }
    ]
  },
  "deep-crm-analytics": {
    title: "Deep CRM Analytics",
    description: "Granular insights into message delivery, read rates, and agent performance to drive data-back growth.",
    icon: <BarChart3 className="w-12 h-12" />,
    features: ["Agent Productivity Tracking", "Campaign ROI Analysis", "Customer Lifetime Value", "Exportable Custom Reports"],
    stats: [
      { label: "Data Latency", value: "< 1m" },
      { label: "Insights Accuracy", value: "99.9%" },
      { label: "Growth Attribution", value: "Direct" }
    ]
  }
}

export default function ServiceDetailView({ id, onBack, onNavigate }: { id: string, onBack: () => void, onNavigate: (page: any) => void }) {
  const service = serviceDetails[id] || serviceDetails["bulk-whatsapp-campaigns"]

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      <main className="pt-32 pb-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white mb-16"
          >
            <span className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 ">
              <Code className="w-4 h-4 rotate-180" />
            </span>
            Back to Ecosystem
          </motion.button>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-8 text-blue-400 font-bold uppercase tracking-widest text-xs">
                <span className="w-2 h-2 bg-blue-500 rounded-full " />
                <span>Premium Service</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter leading-tight text-white">
                {service.title}
              </h1>
              <p className="text-gray-400 text-2xl font-medium leading-relaxed mb-12">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => onNavigate('auth')} className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-xl hover: ">
                  Get Started Now
                </button>
                <button onClick={() => onNavigate('contact')} className="bg-white/5 border border-white/10 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 text-white">
                  Talk to Expert
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/5 backdrop-blur-3xl rounded-[4rem] p-12 lg:p-20 border border-white/10 overflow-hidden ">
                 <motion.div
                  className="absolute inset-0 border-[1.5px] rounded-[4rem] pointer-events-none"
                  animate={{
                    borderColor: [
                      "rgba(59, 130, 246, 0.2)",
                      "rgba(147, 51, 234, 0.2)",
                      "rgba(236, 72, 153, 0.2)",
                      "rgba(34, 197, 94, 0.2)",
                      "rgba(59, 130, 246, 0.2)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <GlowingEffect
                  blur={0}
                  borderWidth={1.5}
                  spread={120}
                  glow={true}
                  disabled={false}
                  proximity={120}
                  inactiveZone={0.01}
                />
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-blue-500/20 ">
                    <div className="text-blue-400">{service.icon}</div>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-white">Enterprise Capable</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Built for scale, secured for life.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {service.stats.map((stat: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 text-center group hover:bg-white/10 cursor-default"
              >
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs mb-4">{stat.label}</p>
                <p className="text-6xl font-bold text-white group-hover:scale-110 transition-transform">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-white/5 rounded-[4rem] p-12 md:p-24 border border-white/5">
            <h2 className="text-4xl md:text-6xl font-bold mb-16 tracking-tighter text-white">Core Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {service.features.map((feature: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-6"
                >
                  <div className="mt-1">
                    <CheckCircle className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-2 text-white">{feature}</h4>
                    <p className="text-gray-400 font-medium leading-relaxed">
                      Industry-leading implementation of {feature.toLowerCase()} to ensure maximum business impact.
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
