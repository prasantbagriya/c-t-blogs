"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { DollarSign, TrendingUp, Target, Briefcase, Palette, Home, BarChart3 } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"

const businessTypes = [
  {
    id: "retail",
    name: "Retail",
    icon: <Briefcase className="w-6 h-6" />,
    multiplier: 3.2,
    description: "E-commerce & Physical Stores",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    icon: <Home className="w-6 h-6" />,
    multiplier: 4.1,
    description: "Agents & Property Management",
  },
  {
    id: "artist",
    name: "Artist",
    icon: <Palette className="w-6 h-6" />,
    multiplier: 2.8,
    description: "Musicians & Content Creators",
  },
  {
    id: "professional",
    name: "Professional Services",
    icon: <Target className="w-6 h-6" />,
    multiplier: 3.7,
    description: "Consultants & Service Providers",
  },
]

export default function ROICalculatorHome() {
  const [selectedBudget, setSelectedBudget] = useState(5000)
  const [selectedBusiness, setSelectedBusiness] = useState("retail")

  const selectedBusinessType = businessTypes.find((b) => b.id === selectedBusiness)
  const multiplier = selectedBusinessType?.multiplier || 3.2

  const calculateROI = (budget: number) => {
    const baseReturn = budget * multiplier
    const scaleFactor = budget / 10000
    return Math.round(baseReturn * (1 + scaleFactor * 0.3))
  }

  const calculateMonthlyRevenue = (budget: number) => {
    return Math.round(calculateROI(budget) / 12)
  }

  return (
    <section className="py-10 relative overflow-hidden bg-black/40 backdrop-blur-xl border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 px-4">Calculate Your ROI</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how much revenue you could generate with our intelligent WhatsApp automations
          </p>
        </motion.div>

        <div className="bg-gray-900/40 border border-white/5 rounded-3xl p-5 sm:p-8 backdrop-blur-sm relative overflow-hidden group">
          <GlowingEffect
            blur={0}
            borderWidth={1.5}
            spread={120}
            glow={true}
            disabled={false}
            proximity={120}
            inactiveZone={0.01}
          />
          {/* Subtle animated background */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(147,51,234,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, rgba(34,197,94,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(249,115,22,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Controls */}
            <div className="space-y-8">
              {/* Business Type Selection */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">Select Your Industry</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {businessTypes.map((business) => (
                    <motion.button
                      key={business.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBusiness(business.id)}
                      className={`p-4 rounded-xl border text-left ${ selectedBusiness === business.id ? "bg-blue-500/20 border-blue-500/50 text-white" : "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-gray-600/50" }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className={`p-2 rounded-lg ${ selectedBusiness === business.id ? "bg-blue-500/30" : "bg-gray-700/50" }`}
                        >
                          {business.icon}
                        </div>
                        <div>
                          <div className="font-medium">{business.name}</div>
                          <div className="text-xs opacity-70">{business.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Budget Slider */}
              <div>
                <label className="block text-lg font-medium text-white mb-4">Monthly Marketing Budget</label>
                <div className="relative">
                  <input
                    type="range"
                    min="1000"
                    max="25000"
                    step="500"
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(Number(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedBudget - 1000) / (25000 - 1000)) * 100}%, #374151 ${((selectedBudget - 1000) / (25000 - 1000)) * 100}%, #374151 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>$1K</span>
                    <span>$25K</span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <span className="text-3xl font-bold text-white">${selectedBudget.toLocaleString()}</span>
                  <span className="text-gray-400 ml-2">per month</span>
                </div>
              </div>

              {/* Data Disclaimer */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-white">Based on Real Client Data</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  These projections are based on actual performance data from our existing clients across similar
                  business types and budget ranges. Individual results may vary.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-8">
              {/* ROI Circle */}
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-600 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 219.8" }}
                    animate={{
                      strokeDasharray: `${Math.min((calculateROI(selectedBudget) / (selectedBudget * 8)) * 219.8, 219.8)} 219.8`,
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06d6a0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      key={`${selectedBudget}-${selectedBusiness}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-white"
                    >
                      {Math.round((calculateROI(selectedBudget) / selectedBudget) * 100)}%
                    </motion.div>
                    <div className="text-gray-400 text-sm">ROI</div>
                  </div>
                </div>
              </div>

              {/* Revenue Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <motion.div
                    key={`monthly-${selectedBudget}-${selectedBusiness}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    ${calculateMonthlyRevenue(selectedBudget).toLocaleString()}
                  </motion.div>
                  <div className="text-gray-400 text-sm">Monthly Revenue</div>
                </div>

                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <motion.div
                    key={`annual-${selectedBudget}-${selectedBusiness}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-white mb-1"
                  >
                    ${calculateROI(selectedBudget).toLocaleString()}
                  </motion.div>
                  <div className="text-gray-400 text-sm">Annual Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
