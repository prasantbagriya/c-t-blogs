"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Download, GraduationCap, Command, Activity, 
  Sparkles, Terminal, ChevronDown, Menu, X 
} from "lucide-react"

const getDevPath = (path) => {
  if (import.meta.env && import.meta.env.DEV) {
    if (path.startsWith('/youtubevideodownload')) return `http://localhost:5173${path}`
    if (path.startsWith('/tool')) return `http://localhost:5175${path}`
    if (path.startsWith('/portal')) return `http://localhost:5176${path}`
  }
  return path
}

const AnimatedNavLink = ({ href, children, target }) => {
  const defaultTextColor = "text-zinc-500 hover:text-white transition-colors duration-255"
  const textSizeClass = "text-[10px] font-bold uppercase tracking-[0.2em]"

  return (
    <a 
      href={href} 
      target={target}
      className={`group relative py-1.5 ${textSizeClass} ${defaultTextColor}`}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-200 group-hover:w-full" />
    </a>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProductsOpen, setIsProductsOpen] = useState(false)

  const products = [
    { title: 'EduExam Pro', path: getDevPath('/portal/'), icon: <GraduationCap size={14} /> },
    { title: 'Solar Extractor', path: getDevPath('/youtubevideodownload/'), icon: <Download size={14} /> },
    { title: 'DevForge Kit', path: getDevPath('/tool/'), icon: <Command size={14} /> },
    { title: '▻ SIP Calculator', path: getDevPath('/tool/sip-calculator/'), icon: <Activity size={14} /> },
    { title: '▻ Compound Growth', path: getDevPath('/tool/compound-interest-calculator/'), icon: <Sparkles size={14} /> },
    { title: '▻ Prop Firm Evaluator', path: getDevPath('/tool/prop-firm/'), icon: <Terminal size={14} /> },
  ]

  const logoElement = (
    <a href={getDevPath("/")} className="flex items-center gap-3.5 group cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-extrabold text-lg transition-colors group-hover:bg-zinc-850">
        P
      </div>
      <div className="flex flex-col text-left">
        <span className="text-lg font-black tracking-tight text-white leading-none">chatwizs studio</span>
        <span className="text-[9px] text-zinc-500 font-bold tracking-[0.2em] uppercase mt-1">Solar Extractor</span>
      </div>
    </a>
  )

  const signupButtonElement = (
    <a 
      href="http://localhost:5177/hub/" 
      className="px-5 py-2.5 text-[9px] font-black rounded-lg w-full sm:w-auto bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all uppercase tracking-[0.15em] inline-flex items-center justify-center"
    >
      CONTROL PANEL
    </a>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-zinc-900 backdrop-blur-xl bg-zinc-950/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">{logoElement}</div>

        <div className="hidden md:flex items-center gap-8">
          <AnimatedNavLink href={getDevPath("/")}>Vision</AnimatedNavLink>
          
          <div 
            className="relative py-2" 
            onMouseEnter={() => setIsProductsOpen(true)} 
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors duration-200">
              Products <ChevronDown size={12} className={`transition-transform duration-200 ${isProductsOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isProductsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 py-2 bg-zinc-900 border border-zinc-800 backdrop-blur-xl rounded-xl shadow-2xl z-50"
                >
                  {products.map(p => (
                    <a key={p.title} href={p.path} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors group">
                      <div className="text-zinc-500 group-hover:text-white group-hover:scale-105 transition-all">{p.icon}</div>
                      <span className="text-zinc-400 group-hover:text-white transition-colors uppercase tracking-[0.15em] text-[9px] font-bold">{p.title}</span>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatedNavLink href="#downloader">Downloader</AnimatedNavLink>
          <AnimatedNavLink href="#about">About</AnimatedNavLink>
          <AnimatedNavLink href="#contact">Contact</AnimatedNavLink>
        </div>

        <div className="hidden sm:flex items-center pl-4 border-l border-zinc-900 transition-colors">
          {signupButtonElement}
        </div>

        <button 
          className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-xl overflow-hidden px-6 py-6 flex flex-col gap-5 text-left"
          >
            <a href={getDevPath("/")} className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Vision</a>
            
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Products</span>
              {products.map(p => (
                <a key={p.title} href={p.path} className="flex items-center gap-3 py-1.5 pl-3 border-l border-zinc-800 hover:border-zinc-500 transition-all text-xs font-semibold text-zinc-400 hover:text-white uppercase tracking-[0.15em]" onClick={() => setIsOpen(false)}>
                  <span className="text-zinc-500">{p.icon}</span>
                  {p.title}
                </a>
              ))}
            </div>

            <a href="#downloader" className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Downloader</a>
            <a href="#about" className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>About</a>
            <a href="#contact" className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-white" onClick={() => setIsOpen(false)}>Contact</a>
            
            <div className="pt-4 border-t border-zinc-900">
              {signupButtonElement}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
