// @ts-nocheck
"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Zap, ChevronDown, Link as LinkIcon, MessageSquareText, FileText, Activity, TrendingUp, Terminal, Video, GraduationCap } from "lucide-react"

const getDevPath = (path) => {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    if (path.startsWith('/youtubevideodownload')) return `http://localhost:5173${path}`
    if (path.startsWith('/tool')) return `http://localhost:5175${path}`
    if (path.startsWith('/portal')) return `http://localhost:5176${path}`
  }
  return path
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isCompanyOpen, setIsCompanyOpen] = useState(false)

  const getHref = (page) => {
    if (page === 'blog') return '/blog';
    if (page === 'auth') return getDevPath('/portal/admin/signup');
    if (page === 'portal' || page.startsWith('portal/')) {
      const path = page === 'portal' ? '/portal/' : "/";
      return getDevPath(path);
    }
    if (page === 'youtubevideodownload') return getDevPath('/youtubevideodownload/');
    
    const toolPages = [
      'prop-firm', 'sip-calculator', 'compound-interest',
      'whatsapp-link-generator', 'whatsapp-direct-message', 'whatsapp-form-generator'
    ];
    if (toolPages.includes(page)) return getDevPath(`/tool/${page}`);
    
    return page === 'landing' ? "/" : `/${page}`;
  }

  const handleNavClick = (e, page) => {
    const targetPage = typeof e === 'string' ? e : page;
    const event = typeof e === 'object' ? e : null;
    
    if (event) event.preventDefault();
    window.location.href = getHref(targetPage);
  }

  const navLinks = [
    { label: 'Blog', page: 'blog' },
    { label: 'Playbook', page: 'playbook' },
    { label: 'Careers', page: 'careers' }
  ]

  const toolsList = [
    { label: 'Link Generator', page: 'whatsapp-link-generator', icon: LinkIcon, color: 'text-blue-600' },
    { label: 'Direct Message', page: 'whatsapp-direct-message', icon: MessageSquareText, color: 'text-blue-600' },
    { label: 'Form Generator', page: 'whatsapp-form-generator', icon: FileText, color: 'text-emerald-600' },
    { label: 'SIP Calculator', page: 'sip-calculator', icon: Activity, color: 'text-purple-600' },
    { label: 'Compound Growth', page: 'compound-interest', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Prop Firm Calc', page: 'prop-firm', icon: Terminal, color: 'text-indigo-600' },
    { label: 'YouTube Downloader', page: 'youtubevideodownload', icon: Video, color: 'text-red-600' },
    { label: 'Exam Portal', page: 'portal', icon: GraduationCap, color: 'text-indigo-600' }
  ]

  const companyList = [
    { label: 'Student Login', page: 'portal/student/login' },
    { label: 'Admin Login', page: 'portal/admin/login' },
    { label: 'About Us', page: 'portal/about-us' },
    { label: 'Contact Us', page: 'portal/contact-us' },
    { label: 'Privacy Policy', page: 'portal/privacy-policy' },
    { label: 'Terms & Conditions', page: 'portal/terms-and-conditions' },
    { label: 'Refund Policy', page: 'portal/refund-policy' },
    { label: 'Cookies Policy', page: 'portal/cookies-policy' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm pointer-events-auto transition-all">
      <div className="w-full max-w-7xl mx-auto px-4">
        <nav className="relative">
          <div className="px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <a href={getHref('landing')} onClick={(e) => handleNavClick(e, 'landing')} className="flex items-center space-x-2 group shrink-0 decoration-transparent">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="text-white w-4 h-4 fill-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tighter">ChatWizs</span>
              </a>

              {/* Desktop Nav */}
              <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
                {navLinks.map(link => (
                  <a
                    key={link.page}
                    href={getHref(link.page)}
                    onClick={(e) => handleNavClick(e, link.page)}
                    className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer decoration-transparent"
                  >
                    {link.label}
                  </a>
                ))}

                <div
                  className="relative"
                  onMouseEnter={() => setIsCompanyOpen(true)}
                  onMouseLeave={() => setIsCompanyOpen(false)}
                >
                  <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors py-4 bg-transparent border-none">
                    Portal <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCompanyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isCompanyOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[80%] left-1/2 -translate-x-1/2 w-48 p-2 bg-white border border-black/5 rounded-2xl shadow-2xl backdrop-blur-xl"
                      >
                        {companyList.map(comp => (
                          <a
                            key={comp.page}
                            href={getHref(comp.page)}
                            onClick={(e) => handleNavClick(e, comp.page)}
                            className="flex items-center w-full p-3 rounded-xl hover:bg-slate-50 transition-colors text-left decoration-transparent"
                          >
                            <span className="text-sm font-bold text-slate-700">{comp.label}</span>
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className="relative"
                  onMouseEnter={() => setIsToolsOpen(true)}
                  onMouseLeave={() => setIsToolsOpen(false)}
                >
                  <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors py-4 bg-transparent border-none">
                    Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isToolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isToolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[80%] left-1/2 -translate-x-1/2 w-64 p-2 bg-white border border-black/5 rounded-2xl shadow-2xl backdrop-blur-xl"
                      >
                        {toolsList.map(tool => (
                          <a
                            key={tool.page}
                            href={getHref(tool.page)}
                            onClick={(e) => handleNavClick(e, tool.page)}
                            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left decoration-transparent"
                          >
                            <div className={`w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${tool.color}`}>
                              <tool.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{tool.label}</span>
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <button onClick={() => handleNavClick(null, 'auth')} className="text-slate-600 hover:text-blue-600 font-bold text-sm bg-transparent border-none">
                  Sign In
                </button>
                <button onClick={() => handleNavClick(null, 'auth')} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-lg active:scale-95 border-none">
                  Get Started
                </button>
              </div>

              {/* Mobile Controls */}
              <div className="md:hidden flex items-center gap-2">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2 bg-transparent border-none">
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-slate-100"
              >
                <div className="grid grid-cols-2 gap-4">
                  {[...navLinks, ...companyList].map(link => (
                    <a key={link.page} href={getHref(link.page)} onClick={(e) => handleNavClick(e, link.page)} className="text-left text-slate-600 hover:text-blue-600 font-bold text-sm py-2 block decoration-transparent">{link.label}</a>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Free Tools</p>
                  <div className="grid grid-cols-1 gap-2 max-h-[30vh] overflow-y-auto pr-2">
                    {toolsList.map(tool => (
                      <a key={tool.page} href={getHref(tool.page)} onClick={(e) => handleNavClick(e, tool.page)} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 capitalize text-left decoration-transparent">
                        <div className={`w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center ${tool.color}`}>
                           <tool.icon className="w-4 h-4" />
                        </div>
                        {tool.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 flex flex-col gap-3">
                  <button onClick={() => handleNavClick(null, 'auth')} className="w-full bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-sm">Sign In</button>
                  <button onClick={() => handleNavClick(null, 'auth')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm">Get Started</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  )
}
