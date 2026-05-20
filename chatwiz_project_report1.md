# ChatWizs — Full Project Feature Report
**Platform:** AI-Powered Omnichannel Business Automation  
**Tech Stack:** React + TypeScript (Frontend) · Node.js + Express (Backend) · Firebase Firestore (Database) · Meta Graph API · Vite

---

## 🏗️ Platform Overview

ChatWizs ek **multi-platform business automation dashboard** hai jo WhatsApp, Instagram, Threads, aur Facebook Pages ko ek jagah se manage karne ki suvidha deta hai. Is platform mein AI-powered auto-reply, flow automation, comment moderation, analytics, aur CRM features shaamil hain.

---

## 📱 Module 1 — WhatsApp Manager

### Core Features
| Feature | Description |
|---|---|
| **Multi-Account Support** | Ek dashboard se multiple WhatsApp Business accounts manage karo |
| **Bulk Messaging** | Hazaron contacts ko ek saath personalized messages bhejo |
| **Campaign Manager** | Campaigns create karo, schedule karo aur track karo |
| **Message Templates** | Meta-approved message templates library — approve/reject/edit |
| **Template Builder** | Drag-and-drop WhatsApp template creator with variable support |
| **Auto Reply** | Keyword-based automatic replies configure karo |
| **Flow Builder** | No-code conversation automation (buttons, lists, forms, videos) |
| **Campaign Insights** | Delivery rate, read rate, reply rate — visual analytics |
| **Account Settings** | WABA ID, phone number, webhook configuration |

### WhatsApp Flow Builder (Advanced)
| Node Type | Functionality |
|---|---|
| Text Message | Plain text reply nodes |
| Button Reply | Multiple choice buttons |
| List Menu | Scrollable options list |
| Image/Video/PDF | Rich media messages |
| Form (NFM) | Native WhatsApp forms |
| Location Request | Capture customer GPS location |
| API Call Node | External webhook trigger |
| Condition Branch | If/else logic routing |
| Flow Entry Trigger | Keyword or button trigger |

---

## 📸 Module 2 — Instagram Manager

### Core Features
| Feature | Description |
|---|---|
| **Multi-Account Support** | Multiple IG Business accounts switch karo |
| **DM Inbox** | Instagram direct messages unified inbox |
| **Comment Manager** | Post comments moderation — reply, delete, filter |
| **Spam Center** | AI-powered spam detection + keyword filtering |
| **Content Publisher** | Photos/videos/reels publish karo directly |
| **Post Scheduler** | Future date par posts schedule karo |
| **Analytics & Insights** | Followers, reach, impressions, engagement — charts |
| **AI Auto Reply** | Comments aur DMs par AI se auto-response |
| **Flow Connect** | Comment se DM tak continuity flow trigger |
| **Smart Automation** | Trigger keyword → Public reply + Private DM + Flow |
| **Keyword Guard** | Auto-delete spam comments by banned word list |
| **Settings** | AI persona, webhook, account config |

### Comment Manager (Advanced)
- Thread-based comment view
- Left sidebar: All post comments feed
- Right panel: Selected comment + replies
- Automate panel: DM trigger + Flow selector + Attachment
- Keyword Guard: Banned words + Auto-delete toggle

---

## 🔵 Module 3 — Facebook Pages Manager

### Core Features
| Feature | Description |
|---|---|
| **Multi-Page Support** | Multiple Facebook Business Pages manage karo |
| **Page Feed** | Posts view aur manage karo |
| **Page Inbox** | Facebook Page messages inbox |
| **Page Analytics** | Fan count, reach, engagement insights |
| **Flow Builder** | Facebook Page ke liye automation flows |
| **Publisher** | Facebook posts create aur publish karo |
| **Settings** | Page configuration aur webhook settings |
| **Connect Flow** | Page ko automation system se link karo |

---

## 🧵 Module 4 — Threads Manager

### Core Features
| Feature | Description |
|---|---|
| **Multi-Account Support** | Multiple Threads accounts manage karo |
| **Content Publisher** | New threads create aur publish karo |
| **Recent Feed** | Published threads ki list |
| **Analytics (Insights Hub)** | Views, Likes, Reposts, Replies, Followers stats |
| **Comment Manager** | Thread replies moderation |
| **DM Inbox** | Activity inbox |
| **Spam Center** | Spam comment detection aur deletion |
| **Smart Automation** | Keyword trigger → Public reply + Private DM + Continuity Flow |
| **Keyword Guard** | Banned words list + Auto-delete mode |
| **Flow Builder** | Threads-specific automation flows |
| **Auto Reply Settings** | AI-powered response configuration |
| **OAuth Popup Flow** | Dashboard navigation kiye bina account connect |

---

## 🤖 Module 5 — AI Agent System

### Core Features
| Feature | Description |
|---|---|
| **Agent Setup Wizard** | Step-by-step AI assistant configure karo |
| **AI Persona** | Business name, description, tone, language set karo |
| **Knowledge Base** | Custom business knowledge AI ko train karo |
| **Knowledge Hub** | Documents, FAQs, product info manage karo |
| **Multi-Channel Agent** | WhatsApp + Instagram + Threads pe ek AI agent |
| **Scam Detection** | AI se incoming spam/scam messages detect karo |
| **Handover Logic** | AI se human agent ko conversation transfer |
| **Context Memory** | Last 10 messages ka context retain karta hai |
| **Shopify Product Context** | AI ko product catalog automatically feed hota hai |

---

## 💬 Module 6 — Unified Inbox

### Core Features
| Feature | Description |
|---|---|
| **Omnichannel Inbox** | WhatsApp + Instagram + Threads — sab ek jagah |
| **Real-time Messages** | Firebase Firestore se live message updates |
| **Chat List** | Conversations sorted by latest activity |
| **Unread Badge Count** | Unread messages ka count sidebar mein |
| **Admin Reply** | Dashboard se seedha customer ko reply karo |
| **Read/Unread Status** | Message read status tracking |
| **Platform Filter** | Platform ke hisaab se filter karo |
| **Search** | Conversation search |

---

## 🔄 Module 7 — Flow Engine (Backend)

### Core Capabilities
| Feature | Description |
|---|---|
| **No-Code Flow Builder** | Visual drag-and-drop flow designer (React Flow based) |
| **Multi-Platform Support** | WhatsApp, Instagram, Threads pe same flow |
| **Trigger System** | Keyword, button, list reply, form submit, location |
| **Condition Branching** | Dynamic routing based on user input |
| **Variable System** | `{{name}}`, `{{phone}}` — personalized messages |
| **API Call Nodes** | External webhook/API trigger from flow |
| **Flow Templates** | Pre-built flow templates library |
| **Flow Auto-Save** | Background mein automatic save |
| **Multi-Step Conversations** | Long conversation journeys design karo |

---

## 📊 Module 8 — Analytics & Reports

| Feature | Platform | Metrics |
|---|---|---|
| **WhatsApp Analytics** | WhatsApp | Campaign delivery, read, reply rates |
| **Campaign Insights** | WhatsApp | Per-campaign detailed breakdown |
| **Instagram Insights** | Instagram | Followers, reach, impressions, engagement |
| **Threads Analytics** | Threads | Views, likes, reposts, replies, followers |
| **Facebook Analytics** | Facebook Pages | Fan count, page reach |
| **Sales Dashboard** | CRM | Lead pipeline, conversion funnel |

---

## 👥 Module 9 — CRM & Contacts

### Features
| Feature | Description |
|---|---|
| **Contacts Database** | Customer contacts store aur manage karo |
| **Import/Export** | CSV contacts import/export |
| **Segmentation** | Tags aur filters se audience segment karo |
| **Leads Hub** | Lead pipeline — New → Contacted → Converted |
| **Lead Source Tracking** | Kahan se aaya lead — WhatsApp, IG, web |
| **Sales Dashboard** | Revenue tracking, conversion rates |

---

## 🛠️ Module 10 — Integrations

| Integration | Features |
|---|---|
| **Shopify** | Product catalog sync, order webhooks, auto-notify customers |
| **Razorpay** | Payment link generation, payment status tracking |
| **Google Sheets** | Data export to spreadsheets |
| **Facebook Business** | Page connection, OAuth login |
| **Instagram Business** | Account connection via Meta OAuth |
| **Threads** | Account OAuth connection |
| **WhatsApp Business API** | WABA setup, webhook, messaging |

---

## 💬 Module 11 — Website Chat Widget

### Features
| Feature | Description |
|---|---|
| **Embeddable Widget** | Kisi bhi website par `<script>` tag se add karo |
| **Chat Interface** | Visitors se real-time chat |
| **Flow Triggers** | Website widget se automation flows trigger |
| **Video Player** | Widget mein embedded video |
| **Form Builder** | Lead capture forms inside widget |
| **Mobile Responsive** | Mobile aur desktop dono pe kaam karta hai |
| **Dark/Light Theme** | Theme customizable |
| **Unread Badge** | Unread message notification icon |
| **Custom Branding** | Logo, color, position configure karo |

---

## 🔐 Module 12 — Auth & User Management

| Feature | Description |
|---|---|
| **Email/Password Auth** | Standard login/signup |
| **Facebook OAuth Login** | Facebook se login |
| **Role-Based Access** | Admin, Manager, User roles |
| **Sub-Account System** | Ek admin ke under multiple users |
| **User Management** | Users add/remove/manage karo |
| **Password Reset** | Email se password reset |
| **JWT Authentication** | Secure API token system |
| **Session Management** | Auto-login, logout handling |

---

## ⚙️ Module 13 — Settings & Configuration

| Setting | Description |
|---|---|
| **Dark/Light Mode** | Global theme toggle |
| **Profile Settings** | Name, email, avatar update |
| **Webhook Config** | Meta webhook verification token |
| **API Keys** | Gemini AI, Meta App credentials |
| **Notification Alerts** | AlertHub — handover notifications |
| **Widget Settings** | Chat widget embed code + config |
| **Payment Gateway** | Razorpay API key setup |

---

## 🔒 Module 14 — Security & Compliance

| Feature | Description |
|---|---|
| **GDPR Data Deletion** | User data delete karne ka endpoint |
| **Deauthorize Webhook** | App disconnect karne par cleanup |
| **Token Encryption** | JWT-based secure API calls |
| **HTTPS Only** | Production aur local dono HTTPS support |
| **Scam Detection** | AI se incoming spam/scam messages detect |
| **Keyword Guard** | Auto-delete spam comments |
| **Rate Limiting** | API misuse protection |
| **Privacy Policy Page** | Built-in privacy policy |
| **Terms of Service Page** | Built-in terms page |

---

## 🌐 Public Pages (Marketing Website)

| Page | Description |
|---|---|
| **Home / Landing** | Animated hero, features showcase |
| **Services** | Offered services list |
| **About Us** | Company story |
| **Contact** | Contact form |
| **Pricing** | Pricing plans |
| **Success Stories** | Customer testimonials |
| **Careers** | Job openings |
| **WhatsApp Link Generator** | Free marketing tool |
| **WhatsApp Direct Message** | Direct message tool |
| **Form Generator** | WhatsApp form tool |
| **Privacy Policy** | Legal page |
| **Terms of Service** | Legal page |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)            │
│   Dashboard · Landing · Auth · Public Pages          │
│   TypeScript · TailwindCSS · Framer Motion           │
└─────────────────────┬───────────────────────────────┘
                      │ REST API + JWT
┌─────────────────────▼───────────────────────────────┐
│              BACKEND (Node.js + Express)             │
│   /api · /auth · /webhooks · /instagram · /threads   │
│   Flow Engine · AI Engine · Scheduler               │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
  ┌────▼────┐   ┌─────▼─────┐  ┌────▼────────┐
  │Firebase │   │ Meta APIs  │  │ 3rd Party   │
  │Firestore│   │ Graph API  │  │ Shopify     │
  │  Auth   │   │ WhatsApp   │  │ Razorpay    │
  └─────────┘   │ Instagram  │  │ Google      │
                │ Threads    │  │ Sheets      │
                │ Facebook   │  └─────────────┘
                └────────────┘
```

---

## 📦 Project Stats

| Metric | Value |
|---|---|
| Total Components | 50+ React components |
| Backend Routes | 100+ API endpoints |
| Supported Platforms | 4 (WhatsApp, Instagram, Threads, Facebook) |
| Flow Node Types | 12+ node types |
| Database | Firebase Firestore (realtime) |
| Build Size | ~2.3 MB (gzipped production) |
| Current Version | v27 (Production Ready) |

---

## 🚀 Deployment Info

| Item | Value |
|---|---|
| **Production URL** | https://chatwizs.com |
| **Frontend** | Vite build → `dist/` folder |
| **Backend** | Node.js server on port 3001 |
| **Database** | Firebase Firestore (cloud) |
| **Web Server** | Apache (.htaccess) |
| **SSL** | HTTPS (required for Meta OAuth) |
| **Latest Build** | `chatwiz-lite-production-ui-fix-v27.zip` |

---

*Report generated: 10 May 2026 | ChatWizs v27*
