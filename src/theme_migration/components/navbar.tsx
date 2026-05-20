"use client"

import React, { useState } from "react"
import { Link } from "./ui/shim"
import { Button } from "./ui/button"
import { Menu, X, Zap, ChevronDown, Link as LinkIcon, MessageSquare, MessageSquareText, FileText } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { ThemeToggle } from "./theme-toggle"

export default function Navbar({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)

  const handleNavClick = (page: string) => {
    onNavigate?.(page)
    setIsMenuOpen(false)
    setIsToolsOpen(false)
  }

  const navLinks = [
    { label: 'Artists', page: 'artists' },
    { label: 'Success Stories', page: 'success-stories' },
    { label: 'Careers', page: 'careers' }
  ]

  return (
    <header className="fixed top-6 left-0 right-0 z-50 w-full px-4 pointer-events-none">
      <div className="w-full max-w-7xl mx-auto pointer-events-auto">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none border border-blue-500/20"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button onClick={() => handleNavClick('landing')} className="flex items-center space-x-2 group shrink-0">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="text-black w-4 h-4 fill-black" />
                </div>
                <span className="text-xl font-bold text-white tracking-tighter">ChatWizs</span>
              </button>

              {/* Desktop Nav */}
              <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
                {navLinks.map(link => (
                  <button
                    key={link.page}
                    onClick={() => handleNavClick(link.page)}
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                ))}

                <div
                  className="relative"
                  onMouseEnter={() => setIsToolsOpen(true)}
                  onMouseLeave={() => setIsToolsOpen(false)}
                >
                  <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors py-4">
                    Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isToolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isToolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[80%] left-1/2 -translate-x-1/2 w-64 p-2 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                      >
                        {[
                          { label: 'Link Generator', page: 'whatsapp-link-generator', icon: LinkIcon, color: 'text-blue-400' },

                          { label: 'Direct Message', page: 'whatsapp-direct-message', icon: MessageSquareText, color: 'text-blue-400' },
                          { label: 'Form Generator', page: 'whatsapp-form-generator', icon: FileText, color: 'text-emerald-400' }
                        ].map(tool => (
                          <button
                            key={tool.page}
                            onClick={() => handleNavClick(tool.page)}
                            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                          >
                            <div className={`w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                              <tool.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-white">{tool.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" onClick={() => handleNavClick('auth')} className="text-gray-400 hover:text-white font-bold text-sm">
                  Sign In
                </Button>
                <button
                  onClick={() => handleNavClick('auth')}
                  className="bg-white text-black px-5 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm shadow-xl active:scale-95"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Controls */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400">
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-md overflow-hidden p-6 space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  {navLinks.map(link => (
                    <button key={link.page} onClick={() => handleNavClick(link.page)} className="text-left text-gray-400 hover:text-white font-bold text-sm py-2">{link.label}</button>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Free Tools</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['whatsapp-link-generator', 'whatsapp-direct-message', 'whatsapp-form-generator'].map(tool => (
                      <button key={tool} onClick={() => handleNavClick(tool)} className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 text-sm font-bold text-white capitalize">
                        {tool.replace('whatsapp-', '').replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                  <button onClick={() => handleNavClick('auth')} className="w-full bg-white/5 text-white py-3 rounded-xl font-bold text-sm">Sign In</button>
                  <button onClick={() => handleNavClick('auth')} className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm">Get Started</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </header>
  )
}
