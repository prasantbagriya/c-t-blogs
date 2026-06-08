"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import {
  Zap, Mail, Phone, MapPin, ArrowRight
} from "lucide-react"
import { Instagram, Twitter, Linkedin, Youtube, Facebook } from "@/src/components/common/BrandIcons"

export default function AnimatedFooter({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [email, setEmail] = useState("")

  const handleNavClick = (page: string) => {
    if (page === 'blog') {
      window.location.href = '/blog';
      return;
    }
    if (page === 'portal') {
      window.location.href = '/portal/';
      return;
    }
    if (page === 'youtubevideodownload') {
      window.location.href = '/youtubevideodownload';
      return;
    }
    if (page === 'playbook') {
      window.location.href = '/playbook/';
      return;
    }
    if (['prop-firm', 'sip-calculator', 'compound-interest'].includes(page)) {
      window.location.href = `/tool/${page}`;
      return;
    }
    onNavigate?.(page);
  }

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { label: "Home", page: "landing" },
        { label: "Artists", page: "artists" },
        { label: "Success Stories", page: "success-stories" },
        { label: "Playbook", page: "playbook" },
        { label: "Careers", page: "careers" }
      ]
    },
    {
      title: "Free Tools",
      links: [
        { label: "Link Generator", page: "whatsapp-link-generator" },
        { label: "Direct Message", page: "whatsapp-direct-message" },
        { label: "Form Generator", page: "whatsapp-form-generator" },
        { label: "SIP Calculator", page: "sip-calculator" },
        { label: "Compound Growth", page: "compound-interest" },
        { label: "Prop Firm Calc", page: "prop-firm" },
        { label: "YouTube Downloader", page: "youtubevideodownload" },
        { label: "Exam Portal", page: "portal" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", page: "help" },
        { label: "Tutorials", page: "tutorials" },
        { label: "Privacy Policy", page: "privacy" },
        { label: "Terms of Service", page: "terms" }
      ]
    }
  ]

  return (
    <footer className="relative bg-black border-t border-white/5 pt-16 pb-10 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

          <div className="col-span-2 lg:col-span-2 space-y-8">
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => handleNavClick('landing')}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="text-black w-5 h-5 fill-black" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">ChatWizs</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Revolutionizing customer engagement with smart AI-driven WhatsApp automation. Join 10,000+ businesses scaling faster with ChatWizs.
            </p>

            <div className="flex gap-4">
              {[
                { Icon: Twitter, url: 'https://x.com/prasantbagriya' },
                { Icon: Facebook, url: 'https://www.facebook.com/chatwizs/' },
                { Icon: Instagram, url: 'https://www.instagram.com/prasantbagriya/' },
                { Icon: Linkedin, url: 'https://www.linkedin.com/company/chatwizs/' },
                { Icon: Youtube, url: 'https://www.youtube.com/@ChatWizsOffical' }
              ].map(({ Icon, url }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group">
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => {
            return (
              <div key={section.title} className="lg:col-span-1">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => {
                    return (
                      <li key={link.label}>
                        <button
                          onClick={() => handleNavClick(link.page)}
                          className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all text-left"
                        >
                          {link.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          <div className="lg:col-span-1">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Stay Updated</h4>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Get the latest AI tips and product updates delivered to your inbox.
              </p>
              <form
                className="relative group"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email) return;
                  try {
                    const res = await fetch("/api/inquiries/collect", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email,
                        source: "footer_newsletter",
                        type: "newsletter"
                      })
                    });
                    if (res.ok) {
                      alert("Successfully joined our newsletter!");
                      setEmail("");
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="absolute right-2 top-2 bottom-2 bg-white text-black px-4 rounded-lg font-bold text-[10px] uppercase hover:bg-gray-100 transition-colors" type="submit">
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} ChatWizs. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Service Status: Operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
