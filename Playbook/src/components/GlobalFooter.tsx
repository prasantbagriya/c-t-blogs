"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import {
  Zap, Mail, Phone, MapPin, ArrowRight
} from "lucide-react"
const Twitter = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Facebook = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const Instagram = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const Linkedin = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const Youtube = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;

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
    const toolPages = [
      'prop-firm', 'sip-calculator', 'compound-interest',
      'whatsapp-link-generator', 'whatsapp-direct-message', 'whatsapp-form-generator'
    ];
    if (toolPages.includes(page)) {
      window.location.href = `/tool/${page}`;
      return;
    }
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.location.href = `/${page === 'landing' ? '' : page}`;
    }
  }

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { label: "Playbook", page: "playbook" },
        { label: "ChatWizs Home", page: "landing" },
        { label: "Artists", page: "artists" },
        { label: "Success Stories", page: "success-stories" },
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
        { label: "About Us", page: "about" },
        { label: "Contact Us", page: "contact" },
        { label: "Editorial Policy", page: "editorial-policy" },
        { label: "Fact Checking", page: "fact-checking-policy" },
        { label: "Privacy Policy", page: "privacy" },
        { label: "Terms of Service", page: "terms" }
      ]
    }
  ]

  return (
    <footer className="relative bg-black border-t border-white/5 pt-16 pb-10 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 mb-16">

          <div className="col-span-2 lg:col-span-2 space-y-8">
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => handleNavClick('landing')}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="text-black w-5 h-5 fill-black" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">ChatWizs</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs text-left">
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
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 text-left">{section.title}</h4>
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
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 text-left">Stay Updated</h4>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed text-left">
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
          <p className="text-xs text-gray-500 font-medium text-left">
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
