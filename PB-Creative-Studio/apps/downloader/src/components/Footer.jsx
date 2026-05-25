import React from "react"
import { Code, Send, Globe, Video } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 relative z-10" style={{ backgroundColor: '#040608' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black mb-6 tracking-tighter">chatwizs studio</h3>
            <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
              Empowering creators and archivists with the next generation of media extraction tools. Fast, secure, and built for the high-fidelity future.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Code size={20} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Send size={20} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Globe size={20} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Video size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Product</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Media Extractor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Endpoint</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600 font-medium tracking-wide">
          <p>© 2026 chatwizs studio Architecture. All rights reserved. Precision Harvesting Infrastructure.</p>
          <div className="flex space-x-8 mt-4 md:mt-0 italic">
            <a href="#" className="hover:text-white transition-colors uppercase">System Status ↗</a>
            <a href="#" className="hover:text-white transition-colors uppercase">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
