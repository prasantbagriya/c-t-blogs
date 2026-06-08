import React, { useState } from 'react';
import { ChevronDown, Check, Zap, Shield, PlayCircle, HardDrive, Smartphone } from 'lucide-react';

const getDevPath = (path) => {
  if (import.meta.env && import.meta.env.DEV) {
    if (path.startsWith('/youtubevideodownload')) return `http://localhost:5173${path}`
    if (path.startsWith('/tool')) return `http://localhost:5175${path}`
    if (path.startsWith('/portal')) return `http://localhost:5176${path}`
  }
  return path
}

const SeoContent = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const steps = [
    {
      title: "Copy the YouTube Video URL",
      desc: "Open YouTube in your browser or mobile app, navigate to the video you want to download, and copy the video link from the address bar or by tapping the Share button and selecting 'Copy Link'."
    },
    {
      title: "Paste the URL into ChatWizs",
      desc: "Go to chatwizs.com/youtubevideodownload and paste the copied link into the input box at the top of the page. Our system will instantly analyze the video and retrieve all available download options."
    },
    {
      title: "Choose Format and Download",
      desc: "Select your preferred format (MP4 for video or MP3 for audio) and pick a quality level (such as 1080p, 720p, 320kbps, etc.). Click the Download button and the file will save directly to your device."
    }
  ];

  const features = [
    { title: "Completely Free", desc: "100% free to use. No premium plans, no subscriptions, and no hidden costs.", icon: <Check size={20} className="text-emerald-400" /> },
    { title: "No Software Required", desc: "Works entirely in your web browser without installing any desktop apps or extensions.", icon: <Zap size={20} className="text-amber-400" /> },
    { title: "No Registration", desc: "Instant and anonymous. Paste a URL and you're done — your privacy is respected.", icon: <Shield size={20} className="text-indigo-400" /> },
    { title: "4K Ultra HD Support", desc: "Fully supports 4K (2160p) and 2K (1440p) video downloads for crystal clear offline viewing.", icon: <PlayCircle size={20} className="text-rose-400" /> },
    { title: "YouTube Shorts & Playlists", desc: "Download vertical Shorts or entire playlists at once in MP4 and MP3 formats.", icon: <HardDrive size={20} className="text-blue-400" /> },
    { title: "Fully Mobile-Friendly", desc: "Works seamlessly on Android smartphones, iPhones, and tablets without an app.", icon: <Smartphone size={20} className="text-purple-400" /> },
  ];

  const faqs = [
    {
      q: "Is it legal to download YouTube videos?",
      a: "Downloading YouTube videos for personal, offline viewing is widely accepted in many countries and is generally considered fair use. However, downloading copyrighted content for redistribution, commercial use, or public sharing without the creator's permission violates YouTube's Terms of Service and may violate copyright law in your jurisdiction. ChatWizs recommends using downloaded content strictly for personal use."
    },
    {
      q: "Do I need to install any software to use ChatWizs?",
      a: "No. ChatWizs is a 100% browser-based online YouTube downloader. You do not need to install any application, browser extension, plug-in, or add-on. The tool runs entirely in your browser — on any operating system."
    },
    {
      q: "Does ChatWizs work on mobile phones?",
      a: "Yes, absolutely. ChatWizs is fully optimized for mobile browsers. It works perfectly on Android devices using Chrome, Firefox, or Samsung Internet, and on iPhones and iPads using Safari or Chrome."
    },
    {
      q: "Can I download 4K Ultra HD YouTube videos?",
      a: "Yes. ChatWizs fully supports 4K (2160p) and 2K (1440p) video downloads, in addition to 1080p, 720p, 480p, and 360p. The available quality depends on the original video's uploaded resolution."
    },
    {
      q: "How do I convert a YouTube video to MP3?",
      a: "Converting to MP3 is simple. Paste the URL, wait for the options, and select the MP3 format. Choose your preferred bitrate (up to 320 kbps) and click Download."
    },
    {
      q: "Can I download YouTube Shorts with ChatWizs?",
      a: "Yes. Paste the YouTube Shorts URL into ChatWizs, and download it as an MP4 file directly to your device — no watermark added."
    },
    {
      q: "How do I download an entire YouTube playlist?",
      a: "Copy the full playlist URL (containing 'list=') and paste it into ChatWizs. You can then choose to download individual videos or the entire playlist at once."
    },
    {
      q: "Why is my download failing or showing an error?",
      a: "Errors can occur if a video is Private, age-restricted, or geo-blocked. Ensure you copy the full 'https://' URL. If it persists, try refreshing or clearing your cache."
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-16 text-zinc-300 font-outfit">
      
      {/* Introduction */}
      <section className="mb-20 text-center md:text-left">
        <p className="text-lg leading-relaxed text-zinc-400">
          Welcome to ChatWizs — the fastest, safest, and most reliable free <a href={getDevPath('/tool/')} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">online video tools</a>. With our powerful YouTube Video Downloader, you can download any YouTube video in seconds, directly from your browser, without installing any software or creating an account. Whether you want to save a full HD video in MP4 format to watch offline, extract high-quality audio as an MP3 file, or download a YouTube Shorts clip, ChatWizs handles it all with a single click.
        </p>
        <p className="text-lg leading-relaxed text-zinc-400 mt-4">
          Our YouTube downloader supports a wide range of resolutions including 4K Ultra HD (2160p), 1080p Full HD, 720p HD, 480p, 360p, and 144p. We also support YouTube playlists, making it easy to save multiple videos at once. ChatWizs is completely free, works on all devices, and requires no registration.
        </p>
      </section>

      {/* Steps */}
      <section className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">How to Download YouTube Videos in 3 Simple Steps</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl relative">
              <div className="absolute -top-5 -left-5 w-10 h-10 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center text-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                {i + 1}
              </div>
              <h3 className="text-xl font-bold text-white mb-4 mt-2">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        {/* Tutorial Video */}
        <div className="mt-12 mb-8 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-zinc-800/80 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/WBRLxOonBqI?controls=0&rel=0&modestbranding=1&fs=0&disablekb=1" 
              title="How to Download YouTube Videos Tutorial" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen>
            </iframe>
          </div>
        </div>

        <div className="mt-8 text-center text-zinc-500 text-sm">
          Check out our detailed <a href="/blog/how-to-download-youtube-videos" className="text-indigo-400 hover:text-indigo-300">how to download YouTube videos guide</a> for more tips.
        </div>
      </section>

      {/* Formats Table */}
      <section className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Supported Formats & Video Quality Options</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800/80 text-zinc-300">
                <th className="p-4 font-semibold text-sm">Format</th>
                <th className="p-4 font-semibold text-sm">Quality Options</th>
                <th className="p-4 font-semibold text-sm">Resolution / Bitrate</th>
                <th className="p-4 font-semibold text-sm">File Size (Approx)</th>
                <th className="p-4 font-semibold text-sm">Best Use Case</th>
              </tr>
            </thead>
            <tbody className="text-sm text-zinc-400">
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="p-4 font-medium text-white">MP4</td>
                <td className="p-4">Ultra HD</td>
                <td className="p-4">4K (2160p) / 2K (1440p)</td>
                <td className="p-4">500MB – 2GB+</td>
                <td className="p-4">4K TV, high-end editing</td>
              </tr>
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="p-4 font-medium text-white">MP4</td>
                <td className="p-4">Full HD / HD</td>
                <td className="p-4">1080p / 720p</td>
                <td className="p-4">50MB – 500MB</td>
                <td className="p-4">Laptop, tablets, streaming</td>
              </tr>
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="p-4 font-medium text-white">MP4</td>
                <td className="p-4">Standard / Low</td>
                <td className="p-4">480p / 360p / 144p</td>
                <td className="p-4">10MB – 100MB</td>
                <td className="p-4">Mobile, low storage</td>
              </tr>
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="p-4 font-medium text-white">MP3</td>
                <td className="p-4">High Quality</td>
                <td className="p-4">320 kbps</td>
                <td className="p-4">5MB – 15MB</td>
                <td className="p-4">Music, podcasts, audiophiles</td>
              </tr>
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="p-4 font-medium text-white">MP3</td>
                <td className="p-4">Standard</td>
                <td className="p-4">192 kbps / 128 kbps</td>
                <td className="p-4">3MB – 10MB</td>
                <td className="p-4">Casual listening, ringtones</td>
              </tr>
              <tr className="hover:bg-zinc-800/20">
                <td className="p-4 font-medium text-white">WebM</td>
                <td className="p-4">HD</td>
                <td className="p-4">1080p / 720p</td>
                <td className="p-4">30MB – 400MB</td>
                <td className="p-4">Browser-based playback</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Features */}
      <section className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Key Features & Benefits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="flex gap-4 items-start p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
              <div className="shrink-0 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">{feat.icon}</div>
              <div>
                <h3 className="font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-zinc-400">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">ChatWizs vs Other Downloaders</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/20">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800/80 text-zinc-300">
                <th className="p-4 font-semibold text-sm text-left">Feature</th>
                <th className="p-4 font-semibold text-sm text-indigo-400">ChatWizs</th>
                <th className="p-4 font-semibold text-sm">Y2Mate</th>
                <th className="p-4 font-semibold text-sm">SaveFrom</th>
                <th className="p-4 font-semibold text-sm">SSYouTube</th>
                <th className="p-4 font-semibold text-sm">SnapSave</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { f: "Completely Free", c: "Yes", o1: "Yes", o2: "Yes", o3: "Yes", o4: "Yes" },
                { f: "No Ads / Pop-ups", c: "Yes", o1: "No", o2: "No", o3: "No", o4: "No" },
                { f: "4K Download", c: "Yes", o1: "Yes", o2: "Yes", o3: "Limited", o4: "No" },
                { f: "YouTube Shorts", c: "Yes", o1: "Limited", o2: "No", o3: "Yes", o4: "No" },
                { f: "MP3 320kbps", c: "Yes", o1: "Yes", o2: "No", o3: "No", o4: "No" },
                { f: "Playlist Download", c: "Yes", o1: "Yes", o2: "Limited", o3: "No", o4: "No" },
                { f: "No Registration", c: "Yes", o1: "Yes", o2: "Yes", o3: "Yes", o4: "Yes" },
                { f: "Mobile Friendly", c: "Yes", o1: "Partial", o2: "Yes", o3: "Partial", o4: "Yes" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 last:border-0">
                  <td className="p-4 font-medium text-white text-left">{row.f}</td>
                  <td className="p-4 text-emerald-400 font-bold bg-indigo-900/10">{row.c}</td>
                  <td className="p-4 text-zinc-400">{row.o1}</td>
                  <td className="p-4 text-zinc-400">{row.o2}</td>
                  <td className="p-4 text-zinc-400">{row.o3}</td>
                  <td className="p-4 text-zinc-400">{row.o4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto divide-y divide-zinc-800/80 border border-zinc-800/80 rounded-2xl bg-zinc-900/20">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 md:p-6">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center text-left focus:outline-none group"
              >
                <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{faq.q}</h3>
                <ChevronDown className={`shrink-0 text-zinc-500 transition-transform ${openFaq === i ? "rotate-180" : ""}`} size={20} />
              </button>
              {openFaq === i && (
                <p className="mt-4 text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">More Free Tools on ChatWizs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/instagram-video-downloader" className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/80 transition-colors">
            <h4 className="font-bold text-white mb-1">Instagram Video Downloader</h4>
            <p className="text-xs text-zinc-400">Download Instagram Reels, Stories, IGTV and photos in HD.</p>
          </a>
          <a href="/youtube-thumbnail-downloader" className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/80 transition-colors">
            <h4 className="font-bold text-white mb-1">YouTube Thumbnail Downloader</h4>
            <p className="text-xs text-zinc-400">Save thumbnails in multiple resolutions (maxresdefault, hq).</p>
          </a>
          <a href="/youtube-to-mp3" className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/80 transition-colors">
            <h4 className="font-bold text-white mb-1">YouTube to MP3 Converter</h4>
            <p className="text-xs text-zinc-400">Extract high-quality audio tracks easily.</p>
          </a>
          <a href={getDevPath('/tool/')} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/80 transition-colors flex items-center justify-center">
            <span className="font-bold text-indigo-400 hover:text-indigo-300">View All Tools &rarr;</span>
          </a>
        </div>
      </section>
      
    </div>
  );
};

export default SeoContent;
