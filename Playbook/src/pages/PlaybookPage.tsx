/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { PlaybookItem, Lead } from "../types";
import { FileText, Search, SlidersHorizontal, Download, ExternalLink, ShieldCheck, Database, TrendingUp, Clock, Tag, Box, Star, Calendar, DollarSign, Globe, Share2, Copy } from "lucide-react";
import { motion } from "motion/react";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { doc, updateDoc, increment } from "firebase/firestore";
import LeadModal from "../components/LeadModal";

export default function PlaybookPage() {
  const [items, setItems] = useState<PlaybookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Assets");
  const [activeSort, setActiveSort] = useState<"newest" | "name" | "popular" | "featured">("featured");
  const [activePriceFilter, setActivePriceFilter] = useState<"all" | "free" | "paid">("all");

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlaybookItem | null>(null);

  const handleDownload = (item: PlaybookItem) => {
    setSelectedItem(item);
    setIsLeadModalOpen(true);
  };

  const handleLeadSubmit = async (leadData: { name: string; email: string; phone: string }) => {
    if (!selectedItem) return;

    try {
      // 1. Save lead to Firestore
      const leadPayload: Lead = {
        ...leadData,
        playbookId: selectedItem.id,
        playbookTitle: selectedItem.title,
        createdAt: Date.now()
      };
      
      try {
        await addDoc(collection(db, "leads"), leadPayload);
      } catch (error) {
        console.error("Error saving lead:", error);
        // We continue even if lead saving fails to not block user experience, 
        // but ideally rules should allow this.
      }

      // 2. Track download count
      const docRef = doc(db, "playbooks", selectedItem.id);
      await updateDoc(docRef, {
        downloadCount: increment(1)
      });

      // 3. Trigger download
      window.open(selectedItem.fileUrl, "_blank");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "leads");
    }
  };

  const handleShare = (item: PlaybookItem) => {
    const shareUrl = `${window.location.origin}/playbook?id=${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Resource link copied to clipboard!");
  };

  const categories = useMemo(() => ["All Assets", ...Array.from(new Set(items.map(item => item.category)))], [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        const matchesCategory = activeCategory === "All Assets" || item.category === activeCategory;
        const matchesPrice = activePriceFilter === "all" || item.priceType === activePriceFilter;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (activeSort === "name") return a.title.localeCompare(b.title);
        if (activeSort === "popular") return (b.downloadCount || 0) - (a.downloadCount || 0);
        if (activeSort === "featured") {
          if (a.isFeatured === b.isFeatured) return (b.createdAt || 0) - (a.createdAt || 0);
          return a.isFeatured ? -1 : 1;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [items, searchTerm, activeCategory, activePriceFilter, activeSort]);

  useEffect(() => {
    // Dynamic SEO Updates based on current view
    const siteTitle = "Chatwizs Digital Playbook Store";
    if (searchTerm) {
      document.title = `Search: ${searchTerm} | ${siteTitle}`;
    } else if (activeCategory !== "All Assets") {
      document.title = `${activeCategory} Assets | ${siteTitle}`;
    } else {
      document.title = siteTitle;
    }
    
    // Attempt to update meta description for SEO
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.append(metaDesc);
    }
    metaDesc.setAttribute('content', `Browse our collection of ${activeCategory} digital products. Scale your workflow with premium strategies.`);

    // Social & Deep SEO Tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let el = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(isProperty ? 'property' : 'name', name);
        document.head.append(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('og:title', document.title, true);
    updateMeta('og:description', metaDesc.getAttribute('content') || '', true);
    updateMeta('og:type', 'website', true);
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', document.title);

    // Inject JSON-LD for SEO
    let jsonLdScript = document.getElementById('json-ld-products');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'json-ld-products';
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.append(jsonLdScript);
    }
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": filteredItems.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": item.title,
          "description": item.description,
          "sku": item.id,
          "offers": {
            "@type": "Offer",
            "price": item.priceType === 'paid' ? item.price : 0,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    };
    jsonLdScript.textContent = JSON.stringify(structuredData);
  }, [searchTerm, activeCategory, filteredItems]);

  useEffect(() => {
    async function loadPlaybookData() {
      try {
        const q = query(
          collection(db, "playbooks"),
          where("isActive", "==", true)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaybookItem));
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setItems(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "playbooks");
      } finally {
        setLoading(false);
      }
    }
    loadPlaybookData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Immersive Hero Header */}
      <section className="relative overflow-hidden bg-slate-900 pt-20 pb-24 px-6 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#4f46e533,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#6366f111,transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent opacity-30" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-8 backdrop-blur-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Central Asset Registry Protocol
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight mb-8 leading-[1.1]"
          >
            Scale Intelligent <br />
            <span className="text-transparent bg-clip-text bg-linear-to-br from-indigo-400 via-indigo-200 to-white">Workflow Assets</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12 opacity-80"
          >
            Access a secure library of high-performance strategies and technical frameworks designed for modern engineering teams.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-indigo-300 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl">
              <Search className="ml-4 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by title, category, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 text-slate-900 text-sm focus:outline-none placeholder:text-slate-400"
              />
              <button className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                Explore Archives
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Discovery Section */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-10 pb-20 relative z-10">
        {/* Featured Assets Spotlight */}
        {items.some(i => i.isFeatured) && searchTerm === "" && activeCategory === "All Assets" && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-600 fill-current" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Verified Spotlights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.filter(i => i.isFeatured).slice(0, 3).map((item, idx) => (
                <motion.div
                  key={`featured-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-800"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                        <Box className="w-6 h-6 text-indigo-300" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">Featured Product</span>
                        {item.priceType === 'paid' ? (
                          <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">${item.price} Elite</span>
                        ) : (
                          <span className="text-[9px] font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Free Alpha</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{item.seoTitle || item.title}</h3>
                    <div className="prose prose-sm prose-invert line-clamp-2 mb-8 opacity-70 font-medium" dangerouslySetInnerHTML={{ __html: item.description }} />
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                          <Download className="w-4 h-4 text-indigo-300" />
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-200">{item.downloadCount || 0} Hits</span>
                      </div>
                      <button 
                        onClick={() => handleDownload(item)}
                        className="p-3 bg-white text-slate-900 rounded-2xl hover:bg-indigo-400 hover:text-white transition-all active:scale-95 shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Refined Sidebar Navigation */}
          <aside className="w-full lg:w-64 space-y-8">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-100 pb-2">Filter Collections</h3>
              <nav className="flex flex-wrap lg:flex-col gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl text-left transition-all duration-200 flex items-center justify-between group ${
                      activeCategory === cat 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                      : "text-slate-600 hover:bg-white hover:text-indigo-600"
                    }`}
                  >
                    {cat}
                    {activeCategory === cat && <motion.div layoutId="dot" className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                  </button>
                ))}
              </nav>

              <div className="mt-10 pt-8 border-t border-slate-100 hidden lg:block">
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Indexing Status</p>
                  <p className="text-sm font-bold text-slate-900 mb-3 text-display">Real-time Verified</p>
                  <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      className="bg-indigo-600 h-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Distributed Network Live
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Asset Grid Layout */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                {activeCategory}
                <span className="text-sm font-medium text-slate-400 ml-1">({filteredItems.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'free', label: 'Free' },
                    { id: 'paid', label: 'Paid' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActivePriceFilter(p.id as any)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-lg transition-all ${
                        activePriceFilter === p.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                  {[
                    { id: 'newest', label: 'Newest' },
                    { id: 'popular', label: 'Popular' },
                    { id: 'featured', label: 'Featured' },
                    { id: 'name', label: 'A-Z' }
                  ].map(sort => (
                    <button
                      key={sort.id}
                      onClick={() => setActiveSort(sort.id as any)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-lg transition-all ${
                        activeSort === sort.id 
                        ? 'bg-slate-900 text-white' 
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {[1, 2, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-white border border-slate-200/60 rounded-4xl p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
                  >
                    {/* Interior Decorative Elements */}
                    {!item.imageUrl && <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl group-hover:bg-indigo-100/40 transition-colors duration-500" />}
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600/0 group-hover:bg-indigo-600 transition-all duration-500" />
                    
                    <div className="relative flex flex-col h-full">
                      {item.imageUrl && (
                        <div className="w-[calc(100%+3.5rem)] h-48 -mt-7 -mx-7 mb-6 overflow-hidden border-b border-slate-100">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center font-mono text-[11px] font-bold border shadow-inner ${
                            item.fileType === 'pdf' ? 'bg-red-50/50 border-red-100 text-red-600' : 
                            item.fileType === 'ppt' ? 'bg-amber-50/50 border-amber-100 text-amber-600' : 
                            'bg-indigo-50/50 border-indigo-100 text-indigo-600'
                          }`}>
                            <FileText className="w-6 h-6 mb-1" />
                            {item.fileType.toUpperCase()}
                          </div>
                          <div className="flex flex-col gap-1">
                            {item.isFeatured && (
                              <span className="inline-flex items-center gap-1 bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm self-start">
                                <Star className="w-2.5 h-2.5 fill-current" /> Featured
                              </span>
                            )}
                            {item.priceType === 'paid' ? (
                              <span className="inline-flex items-center gap-1 bg-slate-900 text-indigo-300 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm self-start border border-indigo-500/30">
                                <DollarSign className="w-2.5 h-2.5" /> Elite Asset ${item.price || 0}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm self-start border border-indigo-200">
                                Public Resource
                              </span>
                            )}
                            {(Date.now() - (item.createdAt || 0)) < 7 * 24 * 60 * 60 * 1000 && (
                              <span className="inline-flex items-center gap-1 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm self-start">
                                New Resource
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Engagements</span>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <TrendingUp className="w-3 h-3 text-indigo-500" />
                            <span className="text-xs font-mono font-bold text-slate-700">{item.downloadCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">v{item.version || '1.0.0'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                            <Clock className="w-3 h-3" />
                            {item.estimatedMinutes || 5}m read
                          </div>
                        </div>
                        <h3 className="text-xl font-display font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 tracking-tight">
                          {item.seoTitle || item.title}
                        </h3>
                        <div className="prose prose-sm prose-slate line-clamp-3 mb-4 text-sm text-slate-500 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }} />
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {item.tags.map(tag => (
                              <span key={tag} className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <Tag className="w-2.5 h-2.5" />
                                {tag.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100/80">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            Synchronized {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Publisher</span>
                            <span className="text-[10px] font-bold text-slate-500">{item.authorName || 'Internal Core'}</span>
                          </div>
                          <button 
                            onClick={() => handleShare(item)}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Share Resource"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownload(item)}
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/20 active:scale-95"
                          >
                            Extract
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No assets found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  We couldn't find any results matching "{searchTerm}". Try broadening your search.
                </p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-6 text-indigo-600 font-bold hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Visual Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
            <div className="text-left">
              <p className="font-display font-bold text-slate-900">Chatwizs Playbook Store</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© {new Date().getFullYear()} Proper Design Copy Shalom</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
            <a href="#" className="hover:text-indigo-600">Privacy Protocol</a>
            <a href="#" className="hover:text-indigo-600">Terms of Access</a>
            <a href="#" className="hover:text-indigo-600">Archive Support</a>
          </div>
        </div>
      </footer>

      <LeadModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSubmit={handleLeadSubmit}
        item={selectedItem}
      />
    </div>
  );
}
