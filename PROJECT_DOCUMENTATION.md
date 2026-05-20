# ChatWiz AI - Detailed Project Documentation

ChatWiz AI is a comprehensive multi-channel marketing and automation platform designed to streamline communication across WhatsApp, Instagram, and Threads. It combines powerful automation tools with real-time analytics and an integrated CRM.

---

## 1. Core Modules & Features

### 🟢 WhatsApp Automation Hub
*   **Bulk Messaging:** Send personalized campaigns to thousands of contacts using official WhatsApp Business API.
*   **Campaign Analytics:** Track delivered, read, and failed message counts in real-time.
*   **Template Manager:** Create and manage WhatsApp approved message templates directly from the dashboard.
*   **Automation Workflows:** Trigger automated replies based on keywords or incoming message patterns.

### 🟣 Instagram Business Integration
*   **Official Connection:** Secure OAuth linking with Meta Business accounts.
*   **Content Publisher:** Schedule and post Images, Reels, and Stories.
*   **AI Caption Rewrite:** Integrated AI to improve your post captions for better engagement.
*   **Real-time Analytics:** Monitor profile reach, impressions, follower growth, and post-level engagement.
*   **Integrated Inbox:** Manage all Instagram DM conversations within the unified ChatWiz inbox.
*   **AI Comment Moderation:** Real-time scam detection using Gemini AI to flag and auto-delete malicious comments.
*   **Continuity flows (Comment-to-DM):** Automatically transition public comments into private DM conversations and automated sales flows.

### ⚪ Threads Manager (New)
*   **Direct Publishing:** Post text, images, and videos directly to Threads.
*   **Real-time Feed:** View your latest Threads posts and their performance inside the dashboard.
*   **Engagement Metrics:** Track Views, Likes, Replies, and Reposts using real-time Meta Graph data.
*   **AI Auto-Reply:** Toggleable AI agent to automatically handle thread replies with business-aware logic.
*   **Spam Center:** Dedicated security hub to monitor and manage flagged spam content.
*   **Live Preview:** See exactly how your Thread will look on mobile before posting.

---

## 2. Advanced Automation Tools

### 🛠️ Visual Flow Builder
*   **Node-based Interface:** Drag-and-drop system to build complex automation logic.
*   **Smart Nodes:**
    *   **Message Node:** Send text, media, or interactive buttons.
    *   **Conditional Logic:** Route users based on their replies or attributes.
    *   **External API Node:** Connect your automation to third-party tools (CRMs, Google Sheets, etc.).
    *   **Wait Node:** Add intentional delays to simulate human-like interaction.
    *   **Handoff Node:** Automatically transfer a chat to a human agent when needed.

### 🧠 Knowledge Hub (AI Training)
*   **Document Training:** Upload PDFs or text documents to train your AI assistant.
*   **Website Crawling:** Train the AI using your website's public information.
*   **Social Guard (Scam Detection):** Integrated AI moderation using Gemini 1.5-Flash to protect accounts from scams and malicious engagement.
*   **Contextual Replies:** AI uses this custom knowledge to answer customer queries accurately on WhatsApp/Instagram.

---

## 3. Communication & Lead Management

### 📬 Unified Inbox (Omnichannel)
*   **Multi-Channel Support:** Manage WhatsApp, Instagram, and Threads messages in a single view.
*   **Contact Profiles:** View customer history, tags, and custom attributes next to the chat window.
*   **Quick Replies:** Use pre-saved snippets to answer common questions instantly.
*   **Search & Filter:** Find conversations by platform, date, or unread status.

### 🎯 Leads Hub & CRM
*   **Form Capture:** Automatically track data submitted through automation flows.
*   **Lead Pipeline:** Manage leads through different stages (New, Contacted, Qualified, etc.).
*   **Data Export:** Export your leads to CSV/Excel for external marketing use.

---

## 4. Platform Administration

### 👥 User Management
*   **Parent/Sub-Account System:** Agencies can manage multiple clients under a single parent account.
*   **Role-Based Access:** Control which features sub-users can access.

### 💳 Billing & Subscriptions
*   **Razorpay Integration:** Automated billing for platform usage and message credits.
*   **Usage Tracking:** Transparent monitoring of API calls and automation executions.

### 🔒 Security & Reliability
*   **Official Meta APIs:** Built using official Facebook/Instagram/Threads Graph APIs for account safety.
*   **Encrypted Storage:** All sensitive access tokens are stored securely on the backend.

---

## 5. Technical Stack
*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion (for animations).
*   **Backend:** Node.js (Express), Firebase (Real-time DB), Official Meta SDKs.
*   **Hosting:** Compatible with all modern VPS and shared hosting environments (Node-ready).

---
*Documentation Version: 1.2 (May 2026)*
