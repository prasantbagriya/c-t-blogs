/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "firebase/auth";
import RichTextEditor from "../components/RichTextEditor";
// Firebase removed for data and files, Auth remains in App/Login
import { PlaybookItem, Lead } from "../types";
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  X,
  FileSpreadsheet,
  Users,
  TrendingUp,
  Search,
  DollarSign,
  Globe,
  Tag as TagIcon,
  Download,
  Mail,
  Smartphone,
  Edit2,
  Image as ImageIcon
} from "lucide-react";


interface AdminPageProps {
  user: User;
}

export default function AdminPage({ user }: AdminPageProps) {
  const [items, setItems] = useState<PlaybookItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [leadFilterItem, setLeadFilterItem] = useState("All");
  const [activeTab, setActiveTab] = useState<"files" | "leads">("files");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tagsInput: "",
    version: "1.0.0",
    fileType: "pdf" as PlaybookItem["fileType"],
    fileUrl: "",
    imageUrl: "",
    isFeatured: false,
    estimatedMinutes: 5,
    priceType: "free" as "free" | "paid",
    price: 0,
    seoTitle: "",
    seoDescription: "",
    slug: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadRegistryItems();
    loadLeads();
    repairMissingFields();
  }, []);

  const repairMissingFields = async () => {
    // Handled by backend now
  };

  const loadLeads = async () => {
    try {
      const response = await fetch('/api/playbook/leads');
      if (response.ok) {
        const data = await response.json();
        data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setLeads(data);
      }
    } catch (err) {
      console.error("Error loading leads:", err);
    }
  };

  const loadRegistryItems = async () => {
    try {
      const response = await fetch('/api/playbook/items');
      if (response.ok) {
        const data = await response.json();
        data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setItems(data);
      }
    } catch (err) {
      console.error("Error loading playbooks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/playbook/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(prev => ({ ...prev, fileUrl: data.url }));
      setUploadStatus({ type: 'success', message: `Manifest synced: ${file.name}` });
    } catch (err: any) {
      setUploadStatus({ type: 'error', message: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    setImageUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/playbook/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setImageUploadStatus({ type: 'success', message: `Cover synced: ${file.name}` });
    } catch (err: any) {
      setImageUploadStatus({ type: 'error', message: err.message });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl && !editingId) {
      alert("Please upload an asset first.");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tagsInput.split(",").map(t => t.trim()).filter(t => t !== ""),
        version: formData.version,
        fileType: formData.fileType,
        fileUrl: formData.fileUrl,
        imageUrl: formData.imageUrl,
        isFeatured: formData.isFeatured,
        estimatedMinutes: formData.estimatedMinutes,
        priceType: formData.priceType,
        price: formData.priceType === 'paid' ? formData.price : 0,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        updatedAt: Date.now(),
      };

      if (editingId) {
        await fetch(`/api/playbook/items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/playbook/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            createdAt: Date.now(),
            authorId: user.uid,
            authorName: user.displayName || user.email?.split("@")[0] || "Admin",
            isActive: true,
            downloadCount: 0,
          })
        });
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        tagsInput: "",
        version: "1.0.0",
        fileType: "pdf",
        fileUrl: "",
        imageUrl: "",
        isFeatured: false,
        estimatedMinutes: 5,
        priceType: "free",
        price: 0,
        seoTitle: "",
        seoDescription: "",
        slug: "",
      });
      setSelectedFile(null);
      setUploadStatus(null);
      loadRegistryItems();
    } catch (err) {
      console.error("Error saving document:", err);
    }
  };

  const handleEdit = (item: PlaybookItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      tagsInput: item.tags ? item.tags.join(", ") : "",
      version: item.version || "1.0.0",
      fileType: item.fileType || "pdf",
      fileUrl: item.fileUrl || "",
      imageUrl: item.imageUrl || "",
      isFeatured: item.isFeatured || false,
      estimatedMinutes: item.estimatedMinutes || 5,
      priceType: item.priceType || "free",
      price: item.price || 0,
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
      slug: item.slug || "",
    });
    setIsAdding(true);
    setActiveTab("files");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStatus = async (item: PlaybookItem) => {
    try {
      await fetch(`/api/playbook/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !item.isActive,
        })
      });
      loadRegistryItems();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (item: PlaybookItem) => {
    if (!confirm(`Confirm permanent deletion of "${item.title}" from server registry?`)) return;
    try {
      await fetch(`/api/playbook/items/${item.id}`, {
        method: 'DELETE'
      });
      loadRegistryItems();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "downloadCount">("createdAt");

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "All" || item.category.toUpperCase() === filterCategory.toUpperCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "downloadCount") return (b.downloadCount || 0) - (a.downloadCount || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  const stats = {
    total: items.length,
    active: items.filter(i => i.isActive).length,
    downloads: items.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0)
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Asset URL copied to clipboard!");
  };

  const categories = ["All", ...Array.from(new Set(items.map(item => item.category.toUpperCase())))];

  const exportLeadsToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ["Name", "Email", "Phone", "Playbook", "Date"];
    const rows = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.playbookTitle,
      new Date(lead.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `playbook-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLeadEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    alert(`Email copied: ${email}`);
  };

  const copyAllEmails = () => {
    const emails = filteredLeads.map(l => l.email).join(", ");
    navigator.clipboard.writeText(emails);
    alert(`Copied ${filteredLeads.length} emails to clipboard!`);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(leadSearchTerm.toLowerCase()) || 
                         lead.email.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
                         lead.phone.includes(leadSearchTerm);
    const matchesPlaybook = leadFilterItem === "All" || lead.playbookTitle === leadFilterItem;
    return matchesSearch && matchesPlaybook;
  });

  const uniqueLeadPlaybooks = ["All", ...Array.from(new Set(leads.map(l => l.playbookTitle)))];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-600" />
            Registry Control Center
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Authenticated Admin: {user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/playbook"
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
          >
            <Eye className="w-4 h-4" /> View Public
          </Link>
          <button
            onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
            isAdding 
            ? "bg-white border border-slate-200 text-slate-600" 
            : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isAdding ? <><X className="w-5 h-5" /> Close Panel</> : <><Plus className="w-5 h-5" /> Upload File</>}
        </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit mb-8 border border-slate-200/60">
        <button
          onClick={() => setActiveTab("files")}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === "files" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Assets Library
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === "leads" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" /> Captured Leads
          {leads.length > 0 && (
            <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px]">
              {leads.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "files" ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Registry</p>
                <h3 className="text-2xl font-bold text-slate-900">{items.length} Files</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conversion Rate</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.downloads > 0 ? ((leads.length / stats.downloads) * 100).toFixed(1) : 0}% CTR
                </h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Telemetry</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.downloads} Accesses
                </h3>
              </div>
            </div>
          </div>
          
          {/* File management logic... */}
          {isAdding && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 mb-10 shadow-sm animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                      <Settings className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Core Configuration</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Asset Name</label>
                      <input
                        required
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                        placeholder="e.g., Marketing_Strategy_V2.pdf"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Monetization</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, priceType: 'free' })}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              formData.priceType === 'free' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'
                            }`}
                          >
                            Public
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, priceType: 'paid' })}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              formData.priceType === 'paid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'
                            }`}
                          >
                            Elite
                          </button>
                        </div>
                      </div>
                      {formData.priceType === 'paid' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price (USD)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                              type="number"
                              className="w-full pl-8 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-mono"
                              value={formData.price}
                              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Description</label>
                      <RichTextEditor
                        content={formData.description}
                        onChange={(content) => setFormData({ ...formData, description: content })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registry Category</label>
                        <input
                          required
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 uppercase text-xs"
                          placeholder="e.g., SALES"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Iteration</label>
                        <input
                          required
                          type="text"
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-mono"
                          value={formData.version}
                          onChange={e => setFormData({ ...formData, version: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={formData.isFeatured}
                          onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                        />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                          Featured
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="number"
                          className="w-16 bg-transparent border-b border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500"
                          value={formData.estimatedMinutes}
                          onChange={e => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">MIN</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">SEO & Search Optimization</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">SEO Display Title</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 text-xs"
                        placeholder="Search engine optimized name..."
                        value={formData.seoTitle}
                        onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">URL Slug</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-mono text-xs"
                        placeholder="e-g-product-slug"
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Meta Description</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-slate-800 text-xs"
                        placeholder="Brief summary for search indexing..."
                        value={formData.seoDescription}
                        onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Product Tags</label>
                      <div className="relative">
                        <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 text-xs"
                          placeholder="technical, strategy, framework..."
                          value={formData.tagsInput}
                          onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
                        />
                      </div>
                    </div>

                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mt-6">
                        <ImageIcon className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Visual Asset (Cover)</h3>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/10 transition-all bg-slate-50/50 relative overflow-hidden">
                        {formData.imageUrl ? (
                          <div className="relative group w-full h-32 rounded-xl overflow-hidden mb-2">
                            <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <label htmlFor="image-upload" className="cursor-pointer bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">Change Cover</label>
                            </div>
                          </div>
                        ) : (
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className={`${imageUploading ? 'animate-bounce' : ''} bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200 shadow-sm transition-transform active:scale-90`}>
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-slate-800 mb-1">
                              Upload Cover Image
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">16:9 recommended</div>
                          </label>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                        {imageUploadStatus && (
                          <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${imageUploadStatus.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                            {imageUploadStatus.message}
                          </p>
                        )}
                      </div>

                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mt-6">
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Binary Sync</h3>
                    </div>

                    <div className="flex gap-2">
                      {["pdf", "ppt", "docx", "other"].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, fileType: type as any })}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                            formData.fileType === type 
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-indigo-400"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/10 transition-all bg-slate-50/50">
                      <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            handleFileUpload(file);
                          }
                        }}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className={`${uploading ? 'animate-bounce' : ''} bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200 shadow-sm transition-transform active:scale-90`}>
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-800 mb-1">
                          {selectedFile ? selectedFile.name : "Deploy binary asset"}
                        </div>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={!formData.fileUrl || uploading}
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-indigo-500/10 active:scale-[0.98]"
                    >
                      Commit to Registry
                    </button>
                  </div>
              </form>
            </div>
          )}

          {/* Registry Header with Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
                <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest min-w-fit">Filter</h2>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar grow">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                          filterCategory === cat 
                          ? "bg-slate-900 text-white shadow-sm" 
                          : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest min-w-fit">Sort</h2>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="createdAt">Recent First</option>
                    <option value="title">Alphabetical</option>
                    <option value="downloadCount">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search registry..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Server Registry</h2>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {filteredItems.length} RESULT(S)
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Asset Matrix</th>
                    <th className="px-6 py-4">Index Space</th>
                    <th className="px-6 py-4">Visibility</th>
                    <th className="px-6 py-4">Telemetry</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">Querying distributed nodes...</td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">No assets found matching criteria.</td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors text-sm group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</div>
                            {item.isFeatured && (
                              <span className="bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm">Featured</span>
                            )}
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm ${
                              item.priceType === 'paid' ? 'bg-slate-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                            }`}>
                              {item.priceType === 'paid' ? `$${item.price} ELITE` : 'PUBLIC'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-50 uppercase">ID: {item.id.slice(0, 8)} | v{item.version} | {item.estimatedMinutes || 0}m</div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-[8px] font-bold text-slate-400 border border-slate-100 px-1 rounded">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                            {item.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Network_Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-slate-300 font-bold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Internal_Only
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hits</p>
                              <div className="flex items-center gap-1.5 justify-center mt-0.5">
                                <p className="text-[11px] font-mono font-bold text-slate-700">{item.downloadCount || 0}</p>
                                <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500" 
                                    style={{ width: `${Math.min(100, ((item.downloadCount || 0) / (stats.downloads || 1)) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Created</p>
                              <p className="text-[11px] font-mono text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => copyToClipboard(item.fileUrl)}
                              className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Copy Resource Link"
                            >
                              <TrendingUp className="w-4 h-4 rotate-45" />
                            </button>
                            <button 
                              onClick={() => toggleStatus(item)}
                              className={`p-2 rounded-lg transition-colors ${item.isActive ? 'text-green-500 hover:bg-green-50' : 'text-slate-300 hover:bg-slate-100'}`}
                              title={item.isActive ? "Withdraw from Public" : "Publish to Library"}
                            >
                              {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Asset"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Purge Binary"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Leads Tab Section */
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Lead Intelligence</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Manage and export your captured client data</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={copyAllEmails}
                className="flex-1 md:flex-none px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Mail className="w-4 h-4" /> Copy All
              </button>
              <button 
                onClick={exportLeadsToCSV}
                className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name, email or phone..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                value={leadSearchTerm}
                onChange={e => setLeadSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-1.5 border border-slate-200 rounded-2xl">
              <TagIcon className="w-4 h-4 text-slate-400" />
              <select
                className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none w-full py-2"
                value={leadFilterItem}
                onChange={e => setLeadFilterItem(e.target.value)}
              >
                {uniqueLeadPlaybooks.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Communication</th>
                    <th className="px-6 py-4">Acquired Asset</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 text-slate-200" />
                          No leads found matching your filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors text-sm group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{lead.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono tracking-tighter">REF_{lead.id?.slice(-8).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-600 group/link">
                              <Mail className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-xs font-medium">{lead.email}</span>
                              <button 
                                onClick={() => copyLeadEmail(lead.email)}
                                className="opacity-0 group-hover/link:opacity-100 transition-opacity p-0.5 hover:text-indigo-600"
                                title="Copy Email"
                              >
                                <Download className="w-3 h-3 rotate-45" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Smartphone className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-xs font-medium">{lead.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                            <span className="font-bold text-slate-700">{lead.playbookTitle}</span>
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Asset_ID: {lead.playbookId.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-400 font-mono italic">{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Communication Verified"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
