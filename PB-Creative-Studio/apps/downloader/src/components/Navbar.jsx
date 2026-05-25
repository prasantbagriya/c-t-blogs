"use client"

import React, { useState, useEffect, useRef } from "react"
import { Download } from "lucide-react"

const AnimatedNavLink = ({ href, children }) => {
  const defaultTextColor = "text-zinc-500"
  const hoverTextColor = "text-white"
  const textSizeClass = "text-sm font-medium"

  return (
    <a href={href} className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}>
      <div className="relative flex flex-col transition-transform duration-500 ease-[0.16,1,0.3,1] transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={`${hoverTextColor} absolute top-full left-0`}>{children}</span>
      </div>
    </a>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full")
  const shapeTimeoutRef = useRef(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current)
    }

    if (isOpen) {
      setHeaderShapeClass("rounded-2xl")
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full")
      }, 300)
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current)
      }
    }
  }, [isOpen])

  const logoElement = (
    <a href={import.meta.env && import.meta.env.DEV ? "http://localhost:5174/" : "/"} className="flex items-center gap-3 group shrink-0">
      <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-500 shadow-[0_0_25px_rgba(255,255,255,0.2)]">
        <Download size={18} strokeWidth={3} />
      </div>
      <span className="text-xl font-bold tracking-tighter text-white flex items-center">
        NEXTGEN<span className="text-zinc-500 mx-0.5 mt-[-2px]">/</span>X
      </span>
    </a>
  )

  const navLinksData = [
    { label: "Downloader", href: "#downloader" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ]

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
      <div
        className="absolute inset-0 -m-1 rounded-full
                     hidden sm:block
                     bg-violet-500/20
                     opacity-0 filter blur-lg pointer-events-none
                     transition-all duration-300 ease-out
                     group-hover:opacity-100 group-hover:blur-xl group-hover:-m-2"
      ></div>
      <button className="relative z-10 px-7 py-2.5 text-xs font-black rounded-full w-full sm:w-auto btn-thermal uppercase tracking-[0.2em]">
        CONTROL PANEL
      </button>
    </div>
  )

  return (
    <header
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50
                       flex flex-col items-center
                       px-2 py-2 backdrop-blur-xl
                       ${headerShapeClass}
                       border border-white/10 bg-black/60
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-300 ease-in-out shadow-2xl`}
    >
      <div className="flex items-center justify-between w-full sm:w-auto gap-x-8 md:gap-x-12 px-4 py-1">
        <div className="flex items-center">{logoElement}</div>

        <nav className="hidden md:flex items-center space-x-10 text-sm">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center pl-4 border-l border-white/10 transition-colors">
          {signupButtonElement}
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`md:hidden flex flex-col items-center w-full transition-all ease-[0.16,1,0.3,1] duration-500 overflow-hidden
                       ${isOpen ? "max-h-[1000px] opacity-100 mt-6 pb-6 px-6" : "max-h-0 opacity-0 mt-0 pointer-events-none"}`}
      >
        <nav className="flex flex-col items-center space-y-6 text-lg w-full mb-8 pt-4 border-t border-white/5">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors w-full text-center font-bold tracking-tighter"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="w-full">
          {signupButtonElement}
        </div>
      </div>
    </header>
  )
}
