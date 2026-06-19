# 🚀 ChatWizs — Hostinger Deployment Guide (Hindi & English)

यहाँ आपकी नई, अपडेटेड और अत्यधिक अनुकूलित (optimized) **Lite ZIP फ़ाइल** के लिए डिप्लॉयमेंट गाइड है। यह फ़ाइल आपके होस्टिंग सर्वर पर बहुत तेज़ी से अपलोड होगी (सिर्फ **4.4 MB**) क्योंकि इसमें फालतू फ़ाइलें जैसे `node_modules` और `.next` शामिल नहीं हैं—इन्हें सीधे आपके सर्वर पर ही जनरेट किया जाएगा।

👉 **ZIP File Location on your PC**: `f:\blogs\chatwizs-geo-lite.zip`

---

## 🇮🇳 Hindi (Hinglish) Guide — स्टेप-बाय-स्टेप डिप्लॉयमेंट

> [!IMPORTANT]
> यह एक **Next.js dynamic website** है, इसलिए इसे Hostinger पर चलाने के लिए आपके पास **Node.js Hosting** या **VPS Hosting** होना चाहिए। (साधारण PHP Shared Hosting पर Next.js नहीं चल सकता)।

### स्टेप 1: फ़ाइल अपलोड और एक्सट्रैक्ट करें (Upload & Extract)
1. अपने **Hostinger hPanel** में जाएं और **File Manager** खोलें।
2. अपने डोमेन के मुख्य फ़ोल्डर (जैसे `/public_html` या आपका Node app directory) में जाएं।
3. अपने कंप्यूटर से `f:\blogs\chatwizs-geo-lite.zip` फ़ाइल को अपलोड करें।
4. अपलोड होने के बाद, ज़िप फ़ाइल पर राइट-क्लिक करें और **Extract** पर क्लिक करें। सभी फ़ाइलें उसी फ़ोल्डर में अनपैक हो जाएंगी।

### स्टेप 2: डिपेंडेंसी इनस्टॉल करें (Install Dependencies)
1. अपने सर्वर को **SSH** (PuTTY, Termius, या Hostinger Terminal) के ज़रिए कनेक्ट करें।
2. अपने प्रोजेक्ट के फ़ोल्डर में जाएं:
   ```bash
   cd /path/to/your/app
   ```
3. केवल ज़रूरी प्रोडक्शन डिपेंडेंसी इनस्टॉल करने के लिए यह कमांड चलाएं (यह बहुत तेज़ है):
   ```bash
   npm install --production
   ```

### स्टेप 3: एन्वायरमेंट वेरिएबल्स चेक करें (.env.local)
1. सर्वर पर `.env.local` फ़ाइल को चेक करें।
2. इसमें आपका एडमिन पासवर्ड और साइट URL सेट है:
   ```env
   ADMIN_PASSWORD=ChatWizs@2026!Secure
   NEXT_PUBLIC_SITE_URL=https://chatwizs.com
   ```
   *(सुरक्षा के लिए आप इस पासवर्ड को बदल भी सकते हैं।)*

### स्टेप 4: सर्वर पर प्रोजेक्ट बिल्ड करें (Production Build)
1. निम्नलिखित कमांड चलाकर प्रोजेक्ट को बिल्ड करें। इससे आपके सर्वर पर ताज़ा Sitemaps, dynamic SEO rules और optimized assets जनरेट हो जाएंगे:
   ```bash
   npm run build
   ```
   *(यह कमांड सफलतापूर्वक पूरे होते ही आपको `✅ Build Successful` और `✅ Advanced SEO Assets Successfully Deployed` का मैसेज दिखाई देगा।)*

### स्टेप 5: वेबसाइट को PM2 के साथ लाइव करें (Start Server)
1. अपनी वेबसाइट को सर्वर के बैकग्राउंड में 24/7 चालू रखने के लिए **PM2** का उपयोग करें:
   ```bash
   pm2 start npm --name "chatwizs-blog" -- start
   ```
2. स्टेटस चेक करने के लिए:
   ```bash
   pm2 status
   ```
3. एरर लॉग्स देखने के लिए:
   ```bash
   pm2 logs chatwizs-blog
   ```

---

## 🇬🇧 English Guide — Step-by-Step Deployment

### Step 1: Upload & Extract
1. Open your **Hostinger hPanel** -> **File Manager**.
2. Navigate to your target application directory (e.g., `/public_html` or your dedicated Node app folder).
3. Upload `chatwizs-geo-lite.zip` from your PC (`f:\blogs\chatwizs-geo-lite.zip`).
4. Right-click the uploaded file and select **Extract** to unpack everything into the root folder.

### Step 2: Install Runtime Dependencies
1. Connect to your Hostinger server via **SSH** (using Termius, PuTTY, or Hostinger built-in console).
2. Navigate to your extracted application folder.
3. Run the following command to install only production dependencies:
   ```bash
   npm install --production
   ```

### Step 3: Configure Environment Variables
1. Verify or edit the `.env.local` file to ensure the configuration details are correct:
   - `ADMIN_PASSWORD`: Your admin panel login password.
   - `NEXT_PUBLIC_SITE_URL`: Your production domain URL.

### Step 4: Build the Application
1. Compile the production package on the server to optimize static routes and deploy SEO components:
   ```bash
   npm run build
   ```

### Step 5: Start the Server (Keep it Alive 24/7)
1. We highly recommend using **PM2** process manager to ensure your site stays up even after terminal disconnection:
   ```bash
   pm2 start npm --name "chatwizs-blog" -- start
   ```
2. Monitor or manage the running process using:
   - View running apps: `pm2 status`
   - View live logs: `pm2 logs chatwizs-blog`
