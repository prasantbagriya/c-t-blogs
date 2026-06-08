import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Zap, ChevronDown, Link as LinkIcon, MessageSquare, MessageSquareText, FileText, Activity, TrendingUp, Terminal, Video, GraduationCap } from "lucide-react"

const getDevPath = (path) => {
  if (import.meta.env && import.meta.env.DEV) {
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

  const handleNavClick = (page) => {
    if (page === 'blog') {
      window.location.href = '/blog';
      return;
    }
    if (page === 'portal') {
      window.location.href = getDevPath('/portal/');
      return;
    }
    if (page === 'youtubevideodownload') {
      window.location.href = getDevPath('/youtubevideodownload/');
      return;
    }
    if (['prop-firm', 'sip-calculator', 'compound-interest'].includes(page)) {
      window.location.href = getDevPath(`/tool/${page}`);
      return;
    }
    window.location.href = `/${page === 'landing' ? '' : page}`;
  }

  const navLinks = [
    { label: 'Services', page: 'services' },
    { label: 'Pricing', page: 'pricing' },
    { label: 'Blog', page: 'blog' },
    { label: 'Success Stories', page: 'success-stories' },
    { label: 'Contact', page: 'contact' }
  ]

  const toolsList = [
    { label: 'Link Generator', page: 'whatsapp-link-generator', icon: LinkIcon, color: 'text-blue-400' },
    { label: 'Direct Message', page: 'whatsapp-direct-message', icon: MessageSquareText, color: 'text-blue-400' },
    { label: 'Form Generator', page: 'whatsapp-form-generator', icon: FileText, color: 'text-emerald-400' },
    { label: 'SIP Calculator', page: 'sip-calculator', icon: Activity, color: 'text-purple-400' },
    { label: 'Compound Growth', page: 'compound-interest', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Prop Firm Calc', page: 'prop-firm', icon: Terminal, color: 'text-indigo-400' },
    { label: 'YouTube Downloader', page: 'youtubevideodownload', icon: Video, color: 'text-red-400' },
    { label: 'Exam Portal', page: 'portal', icon: GraduationCap, color: 'text-indigo-400' }
  ]

  const companyList = [
    { label: 'About Us', page: 'about' },
    { label: 'Careers', page: 'careers' },
    { label: 'Artists', page: 'artists' },
    { label: 'Privacy Policy', page: 'privacy' },
    { label: 'Terms of Service', page: 'terms' }
  ]

  return (
    <header className="fixed top-6 left-0 right-0 z-100 w-full px-4 pointer-events-none">
      <div className="w-full max-w-7xl mx-auto pointer-events-auto">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
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
                  onMouseEnter={() => setIsCompanyOpen(true)}
                  onMouseLeave={() => setIsCompanyOpen(false)}
                >
                  <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors py-4">
                    Company <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCompanyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isCompanyOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[80%] left-1/2 -translate-x-1/2 w-48 p-2 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                      >
                        {companyList.map(comp => (
                          <button
                            key={comp.page}
                            onClick={() => handleNavClick(comp.page)}
                            className="flex items-center w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                          >
                            <span className="text-sm font-bold text-white">{comp.label}</span>
                          </button>
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
                  <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors py-4">
                    Free Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isToolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isToolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-[80%] left-1/2 -translate-x-1/2 w-64 p-2 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                      >
                        {toolsList.map(tool => (
                          <button
                            key={tool.page}
                            onClick={() => handleNavClick(tool.page)}
                            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                          >
                            <div className={`w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
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
                <button onClick={() => handleNavClick('auth')} className="text-gray-400 hover:text-white font-bold text-sm bg-transparent">
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('auth')}
                  className="bg-white text-black px-5 py-2 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm shadow-xl active:scale-95"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Controls */}
              <div className="md:hidden flex items-center gap-2">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 p-2">
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
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
                  {[...navLinks, ...companyList].map(link => (
                    <button key={link.page} onClick={() => handleNavClick(link.page)} className="text-left text-gray-400 hover:text-white font-bold text-sm py-2">{link.label}</button>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Free Tools</p>
                  <div className="grid grid-cols-1 gap-2 max-h-[30vh] overflow-y-auto pr-2">
                    {toolsList.map(tool => (
                      <button key={tool.page} onClick={() => handleNavClick(tool.page)} className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 text-sm font-bold text-white capitalize text-left">
                        {tool.label}
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
