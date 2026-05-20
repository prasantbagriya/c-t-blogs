"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { ArrowRight, Music, Users, TrendingUp, Play, Headphones, Mic, Radio, ExternalLink, CheckCircle } from "lucide-react"
import { Instagram } from "../../components/common/BrandIcons"
import AnimatedButton from "./animated-button"
import { GlowingEffect } from "./ui/glowing-effect"

const artistServices = [
  {
    title: "Streaming Platform Optimization",
    description: "Maximize your reach on Spotify, Apple Music, YouTube Music, and other platforms",
    features: ["Playlist Pitching", "Release Strategy", "Metadata Optimization", "Cross-Platform Promotion"],
    icon: <Headphones className="w-8 h-8" />,
    price: "Starting at $1,500/month",
  },
  {
    title: "Social Media Growth",
    description: "Build your fanbase across Instagram, TikTok, YouTube, and Twitter",
    features: ["Content Creation", "Community Management", "Viral Strategy", "Influencer Collaborations"],
    icon: <Users className="w-8 h-8" />,
    price: "Starting at $2,000/month",
  },
  {
    title: "Music Video Production",
    description: "Professional music videos that capture your artistic vision",
    features: ["Concept Development", "Professional Filming", "Post-Production", "Distribution Strategy"],
    icon: <Play className="w-8 h-8" />,
    price: "Starting at $5,000",
  },
  {
    title: "Radio & PR Campaigns",
    description: "Get your music heard on radio stations and featured in media outlets",
    features: ["Radio Promotion", "Press Release Distribution", "Media Outreach", "Interview Coordination"],
    icon: <Radio className="w-8 h-8" />,
    price: "Starting at $3,000/campaign",
  },
  {
    title: "Live Performance Marketing",
    description: "Promote your tours, concerts, and live performances effectively",
    features: ["Event Promotion", "Ticket Sales Strategy", "Venue Partnerships", "Fan Engagement"],
    icon: <Mic className="w-8 h-8" />,
    price: "Starting at $1,200/event",
  },
  {
    title: "Brand Partnerships",
    description: "Connect with brands for sponsorships and collaboration opportunities",
    features: ["Brand Matching", "Deal Negotiation", "Campaign Management", "Performance Tracking"],
    icon: <TrendingUp className="w-8 h-8" />,
    price: "15% commission",
  },
]

const successMetrics = [
  { value: "2.5M+", label: "Streams Generated", description: "For our artist clients" },
  { value: "150K+", label: "New Followers", description: "Gained across platforms" },
  { value: "50+", label: "Playlist Placements", description: "On major streaming platforms" },
  { value: "25+", label: "Radio Stations", description: "Playing our artists' music" },
]

const caseStudies = [
  {
    artist: "Luna Beats",
    genre: "Electronic/Pop",
    challenge: "Unknown artist with 500 monthly listeners",
    solution: "Comprehensive streaming strategy + social media growth",
    results: ["1.2M monthly listeners", "Featured on 15 major playlists", "50K Instagram followers"],
  },
  {
    artist: "The Midnight Collective",
    genre: "Indie Rock",
    challenge: "Struggling to break into mainstream market",
    solution: "Radio campaign + music video production",
    results: ["Radio play on 20+ stations", "500K YouTube views", "Signed to major label"],
  },
]

export default function ArtistsPage() {
  const [hoveredService, setHoveredService] = useState<number | null>(null)

  return (
    <section className="py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4 relative z-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Music className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Artist Ecosystem</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
            Artist Marketing <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400">
              Services
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Specialized marketing strategies for established artists ready to take their career to the absolute next level.
          </p>

          {/* Instagram Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <a
              href="https://www.instagram.com/motionrecordsofficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-sm text-gray-300 hover:border-blue-500/50 hover:bg-white/10 transition-all group"
            >
              <Instagram className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
              Follow @motionrecordsofficial
              <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
            </a>
          </motion.div>
        </motion.div>

        {/* Success Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 border-y border-white/5 py-16">
          {successMetrics.map((metric, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center group relative p-6 rounded-2xl border border-white/5 bg-gray-900/10 backdrop-blur-sm overflow-hidden"
            >
              <GlowingEffect
                blur={0}
                borderWidth={1.5}
                spread={60}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="relative z-10">
                <div 
                  className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter group-hover:scale-110 transition-transform"
                  style={{ textShadow: '0 0-30px rgba(129,140,248,0.4)' }}
                >
                  {metric.value}
                </div>
                <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{metric.label}</div>
                <div className="text-[10px] text-gray-500 font-medium px-4 leading-normal">{metric.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white tracking-widest uppercase">Comprehensive Services</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artistServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredService(index)}
                onHoverEnd={() => setHoveredService(null)}
                className="relative bg-gray-900/10 border border-gray-800 rounded-[2rem] p-8 backdrop-blur-sm transition-all duration-300 group overflow-hidden"
              >
                <GlowingEffect
                  blur={0}
                  borderWidth={1.5}
                  spread={80}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="text-blue-400 mb-8 bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm font-medium">{service.description}</p>

                <ul className="space-y-4 mb-10">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <span className="text-sm font-black text-white">{service.price}</span>
                  <AnimatedButton className="bg-white text-black hover:bg-gray-100 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl">
                    Inquire Now
                  </AnimatedButton>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Case Studies */}
        <div className="mb-32">
          <h2 className="text-3xl font-bold text-white text-center mb-16 tracking-widest uppercase">Artist Success Stories</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.artist}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-900/5 backdrop-blur-sm border border-white/5 rounded-[3rem] overflow-hidden group hover:border-white/10 transition-all relative"
              >
                <GlowingEffect
                  blur={0}
                  borderWidth={1.5}
                  spread={120}
                  glow={true}
                  disabled={false}
                  proximity={120}
                  inactiveZone={0.01}
                />
                <div className="relative z-10">
                  <div className="aspect-video bg-gray-900/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music className="w-20 h-20 text-white/5 group-hover:scale-110 group-hover:text-white/10 transition-all duration-700" />
                    </div>
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-3xl font-black text-white mb-1">{study.artist}</h3>
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em]">{study.genre}</p>
                    </div>
                  </div>

                  <div className="p-10 grid md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Challenge</h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{study.challenge}</p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Strategy</h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{study.solution}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5">
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Performance Results</h4>
                      <ul className="space-y-4">
                        {study.results.map((result, i) => (
                          <li key={i} className="text-sm text-white font-bold flex items-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center relative py-20 px-8 rounded-[4rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
          <div className="absolute inset-0 backdrop-blur-3xl border border-white/10 rounded-[4rem]" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to Amplify?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Join the elite artists transforming their careers with data-driven marketing. Let&apos;s build your legacy together.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <AnimatedButton className="bg-white text-black hover:bg-gray-100 px-10 py-5 text-lg font-black uppercase tracking-widest rounded-2xl">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 px-10 py-5 text-lg font-black uppercase tracking-widest rounded-2xl"
              >
                Our Portfolio
              </AnimatedButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

