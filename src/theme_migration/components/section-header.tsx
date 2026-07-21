"use client"

import { motion } from "motion/react"
import React from 'react'

interface SectionHeaderProps {
  id?: string;
  badge?: string;
  title: string;
  description?: string;
  light?: boolean;
  level?: 'h1' | 'h2';
}

export default function SectionHeader({ id, badge, title, description, light = false, level = 'h2' }: SectionHeaderProps) {
  const Heading = level;
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      {badge && (
        <span className={`text-xs font-black uppercase tracking-[0.2em] ${light ? 'text-blue-600' : 'text-blue-500'} mb-4 block`}>
          {badge}
        </span>
      )}
      <Heading className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${light ? 'text-gray-900' : 'text-white'} mb-6 tracking-tighter`}>
        {title}
      </Heading>
      {description && (
        <p className={`text-xl ${light ? 'text-gray-600' : 'text-gray-400'} max-w-3xl mx-auto font-medium leading-relaxed`}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
