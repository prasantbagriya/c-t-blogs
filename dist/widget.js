(function() {
  const script = document.currentScript || (function() {
    const s = document.getElementsByTagName('script'); return s[s.length - 1];
  })();
  
  // Auto-detect API URL based on script source
  const scriptSrc = script ? script.src : '';
  const API_URL = scriptSrc && scriptSrc.startsWith('http') 
    ? new URL(scriptSrc).origin + '/api' 
    : 'http://localhost:3000/api';
  const userId = window.CHATWIZ_ID || script.getAttribute('data-id');
  if (!userId || window._cwInitialized) return;
  window._cwInitialized = true;

  let config = { 
    businessName: "ChatWiz Support", 
    primaryColor: "#00a884", 
    secondaryColor: "#00a884",
    greeting: "Hello! How can we help you?", 
    bubbleColor: "#00a884", 
    bubbleSize: 55,
    position: "right" 
  };

  let messages = [];
  let isOpen = false;
  let visitorId = localStorage.getItem('cw_vid_' + userId) || 'v_' + Math.random().toString(36).substring(2, 12);
  localStorage.setItem('cw_vid_' + userId, visitorId);

  async function init() {
    try {
      const res = await fetch(`${API_URL}/widget/${userId}?t=${Date.now()}`);
      if (res.ok) {
        const savedConfig = await res.json();
        config = { ...config, ...savedConfig };
      }
    } catch (e) {
      console.warn('[ChatWiz] Using default settings');
    } finally {
      render();
      poll();
      if (!window._cwP) window._cwP = setInterval(poll, 3000);
    }
  }

  async function poll() {
    try {
      const res = await fetch(`${API_URL}/widget/messages/${visitorId}?uid=${userId}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length !== messages.length) { 
          messages = data; 
          update(); 
        }
      }
    } catch(e) {}
  }

  async function send(text) {
    if (!text.trim()) return;
    await fetch(`${API_URL}/widget/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: userId, visitorId, text, senderName: 'Visitor', pageUrl: window.location.href })
    });
    poll();
  }

  function render() {
    const style = document.createElement('style');
    const pos = config.position === 'left' ? 'left' : 'right';
    
    style.innerHTML = `
      #cw-w { position: fixed; bottom: 20px; ${pos}: 20px; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .cw-f { width: ${config.bubbleSize}px; height: ${config.bubbleSize}px; border-radius: 50%; background: ${config.bubbleColor}; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.2s; position: relative; }
      .cw-f:hover { transform: scale(1.05); }
      
      /* Greeting Popup */
      .cw-g { position: absolute; bottom: ${config.bubbleSize + 15}px; ${pos}: 0; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); color: #111b21; padding: 12px 16px; border-radius: 16px; font-size: 13px; width: max-content; max-width: 240px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); display: none; border: 1px solid rgba(0,0,0,0.05); animation: cw-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 100; }
      .cw-g.o { display: block; }
      .cw-g::after { content: ""; position: absolute; bottom: -6px; ${pos}: 15px; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid rgba(255, 255, 255, 0.95); }
      @keyframes cw-pop { from { opacity: 0; transform: translateY(10px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .cw-gx { position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; background: #ef4444; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }

      .cw-p { display: none; position: absolute; bottom: ${config.bubbleSize + 15}px; ${pos}: 0; width: 340px; height: 540px; background: #0b141a; border-radius: 20px; overflow: hidden; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); }
      .cw-p.o { display: flex; animation: cw-s 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      @keyframes cw-s { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      
      .cw-h { padding: 14px 18px; background: ${config.primaryColor}; color: white; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(0,0,0,0.2); position: relative; }
      .cw-a { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.2); object-fit: cover; border: 2px solid rgba(255,255,255,0.2); }
      
      .cw-status-dot { width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid #0b141a; position: absolute; bottom: 18px; left: 52px; box-shadow: 0 0 10px rgba(34,197,94,0.5); }

      .cw-l { flex: 1; overflow-y: auto; padding: 12px 8px 6px 8px; display: flex; flex-direction: column; gap: 4px; background: #0b141a; background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-blend-mode: soft-light; scrollbar-width: thin; scrollbar-color: #374045 transparent; }
      .cw-l::-webkit-scrollbar { width: 4px; }
      .cw-l::-webkit-scrollbar-track { background: transparent; }
      .cw-l::-webkit-scrollbar-thumb { background: #374045; border-radius: 10px; }
      
      .cw-m { max-width: 82%; padding: 8px 12px; border-radius: 12px; font-size: 14px; position: relative; line-height: 1.5; word-break: break-word; white-space: pre-wrap; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
      .cw-m.visitor { align-self: flex-end; background: #005c4b; color: #e9edef; border-top-right-radius: 4px; margin-right: 4px; }
      .cw-m.admin { align-self: flex-start; background: #202c33; color: #e9edef; border-top-left-radius: 4px; margin-left: 4px; border: 1px solid rgba(255,255,255,0.05); }
      
      .cw-msg-footer { display: inline-flex; align-items: center; gap: 3px; float: right; margin-left: 8px; margin-top: 4px; }
      .cw-t { font-size: 10px; color: rgba(233,237,239,0.5); white-space: nowrap; }
      
      .cw-b { padding: 8px 10px; background: #202c33; display: flex; align-items: center; gap: 6px; border-top: 1px solid rgba(255,255,255,0.05); }
      .cw-i { flex: 1; background: #2a3942; border-radius: 24px; padding: 10px 18px; border: 1px solid transparent; outline: none; font-size: 15px; color: #e9edef; font-family: inherit; transition: border-color 0.2s; }
      .cw-i:focus { border-color: ${config.primaryColor}; }
      
      .cw-s { cursor: pointer; color: white; display: flex; align-items: center; padding: 10px; border-radius: 50%; background: ${config.primaryColor}; flex-shrink: 0; transition: transform 0.2s, background 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
      .cw-s:hover { transform: scale(1.1); background: ${config.primaryColor}dd; }
      
      .cw-emoji-btn { cursor: pointer; color: #8696a0; display: flex; align-items: center; padding: 5px; border-radius: 50%; transition: color 0.2s; }
      .cw-emoji-btn:hover { color: ${config.primaryColor}; }
      .cw-emoji-picker { display: none; position: absolute; bottom: 65px; left: 5px; right: 5px; background: #233138; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 5px; grid-template-columns: repeat(8, 1fr); gap: 5px; justify-items: center; box-shadow: 0 -5px 20px rgba(0,0,0,0.3); z-index: 200; max-height: 180px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #374045 transparent; }
      .cw-emoji-picker::-webkit-scrollbar { width: 4px; }
      .cw-emoji-picker::-webkit-scrollbar-thumb { background: #374045; border-radius: 10px; }
      .cw-emoji-picker.o { display: grid; }
      .cw-emoji-item { cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; padding: 5px; border-radius: 6px; transition: background 0.2s; }
      .cw-emoji-item:hover { background: rgba(255,255,255,0.1); }
      
      .cw-pill { align-self: center; background: rgba(32,44,51,0.85); color: #53bdeb; padding: 4px 12px; border-radius: 7px; font-size: 11.5px; margin: 8px 0 4px; display: flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.06); }
      
      .cw-btn-wrap { align-self: flex-start; display: flex; flex-direction: column; gap: 6px; max-width: 85%; margin: 10px 4px; background: rgb(32, 44, 51); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); }
      .cw-btn { background: transparent; color: #53bdeb; border: 1px solid rgba(83,189,235,0.4); padding: 9px 14px; border-radius: 8px; font-size: 14px; cursor: pointer; text-align: center; font-family: inherit; width: 100%; transition: background 0.2s; }
      .cw-btn:hover { background: rgba(83,189,235,0.1); }
      
      .cw-list-wrap { align-self: flex-start; display: flex; flex-direction: column; gap: 5px; max-width: 85%; margin: 10px 4px; background: rgb(32, 44, 51); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); }
      .cw-list-sec { font-size: 10px; color: #8696a0; padding: 0 0 6px 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .cw-list-item { background: #2a3942; color: #e9edef; border: 1px solid rgba(255,255,255,0.07); padding: 10px 14px; border-radius: 7px; font-size: 13.5px; cursor: pointer; text-align: left; font-family: inherit; width: 100%; display: flex; flex-direction: column; gap: 2px; transition: background 0.2s; }
      .cw-list-item:hover { background: #374045; }
      
      .cw-handoff { align-self: center; background: linear-gradient(135deg,#f59e0b,#d97706); color: white; padding: 9px 14px; border-radius: 10px; font-size: 12.5px; margin: 8px 0; display: flex; align-items: center; gap: 8px; max-width: 90%; }
      .cw-video-wrap { width: 100%; border-radius: 12px; overflow: hidden; margin: 10px 0; aspect-ratio: 16/9; background: #000; border: 1px solid rgba(255,255,255,0.1); position: relative; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: transform 0.2s; }
      
      @media (max-width: 768px) {
        .cw-p { width: 100vw; height: 100vh; height: -webkit-fill-available; bottom: 0; right: 0; left: 0; border-radius: 0; z-index: 2147483647; }
        #cw-w { bottom: 0; right: 0; left: 0; width: 100%; height: 0; }
        #cw-w:has(.cw-p.o) { height: 100%; }
        .cw-f { position: fixed; bottom: 20px; right: 20px; z-index: 2147483646; }
        .cw-g { right: 20px !important; left: auto !important; max-width: 80vw; }
      }
      .cw-video-wrap { width: 100%; border-radius: 12px; overflow: hidden; margin: 10px 0; aspect-ratio: 16/9; background: #000; border: 1px solid rgba(255,255,255,0.1); position: relative; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: transform 0.2s; }
      .cw-video-wrap:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }
      .cw-video-wrap iframe { width: 100%; height: 100%; border: none; pointer-events: none; }
      .cw-video-wrap::before { content: "▶"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); color: white; font-size: 40px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); transition: background 0.3s; z-index: 2; }
      .cw-video-wrap:hover::before { background: rgba(0,0,0,0.2); }
      .cw-video-wrap::after { content: "⛶ Full Screen View"; position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; opacity: 0.9; z-index: 3; transition: transform 0.2s; }
      .cw-video-wrap:hover::after { transform: scale(1.05); }
      
      /* Video Modal (Premium Full Screen) */
      #cw-m-vid { position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 2147483647; display: none; align-items: center; justify-content: center; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; }
      #cw-m-vid.o { display: flex; opacity: 1; }
      .cw-m-vid-c { width: 95%; max-width: 1100px; aspect-ratio: 16/9; background: #000; border-radius: 24px; overflow: hidden; position: relative; box-shadow: 0 50px 100px rgba(0,0,0,0.9); border: 1px solid rgba(255,255,255,0.1); transform: scale(0.9); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      #cw-m-vid.o .cw-m-vid-c { transform: scale(1); }
      .cw-m-vid-c iframe { width: 100%; height: 100%; border: none; }
      .cw-m-vid-x { position: absolute; top: 20px; right: 20px; color: white; font-size: 20px; cursor: pointer; z-index: 10; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); }
      .cw-m-vid-x:hover { background: #ef4444; border-color: #ef4444; transform: rotate(90deg); }
      
      @media (max-width: 768px) {
        .cw-m-vid-c { width: 100%; border-radius: 0; aspect-ratio: 16/9; }
        .cw-m-vid-x { top: 10px; right: 10px; width: 36px; height: 36px; font-size: 16px; }
      }
    `;
    document.head.appendChild(style);
    
    const c = document.createElement('div'); c.id = 'cw-w';
    c.innerHTML = `
      <div id="cw-p" class="cw-p">
        <div class="cw-h">
          <img src="${config.avatarUrl || '/logo.png'}" class="cw-a" />
          <div class="cw-status-dot"></div>
          <div style="flex:1; margin-left: 8px">
            <div style="font-weight:700; font-size:15px; letter-spacing: -0.01em">${config.businessName}</div>
            <div style="font-size:11px; opacity: 0.8; font-weight: 500">Active now</div>
          </div>
          <div id="cw-c" style="cursor:pointer; font-size:18px; opacity: 0.8; transition: opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.8">✕</div>
        </div>
        <div id="cw-l" class="cw-l"></div>
        <div id="cw-ep" class="cw-emoji-picker"></div>
        <div class="cw-b">
          <div id="cw-eb" class="cw-emoji-btn"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path></svg></div>
          <input id="cw-i" class="cw-i" placeholder="Type a message" />
          <div id="cw-send" class="cw-s"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg></div>
        </div>
      </div>
      <div id="cw-g" class="cw-g">
        <div id="cw-gx" class="cw-gx">✕</div>
        ${config.greeting}
      </div>
      <div id="cw-f" class="cw-f">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
      </div>
      <div id="cw-m-vid">
        <div class="cw-m-vid-x">✕</div>
        <div class="cw-m-vid-c"></div>
      </div>
    `;
    document.body.appendChild(c);
    const f = c.querySelector('#cw-f'), p = c.querySelector('#cw-p'), i = c.querySelector('#cw-i'), s = c.querySelector('#cw-send'), g = c.querySelector('#cw-g'), gx = c.querySelector('#cw-gx'), eb = c.querySelector('#cw-eb'), ep = c.querySelector('#cw-ep');
    const emojis = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'];
    emojis.forEach(e => {
      const span = document.createElement('span');
      span.className = 'cw-emoji-item';
      span.textContent = e;
      span.onclick = () => { i.value += e; ep.classList.remove('o'); i.focus(); };
      ep.appendChild(span);
    });
    eb.onclick = () => ep.classList.toggle('o');
    f.onclick = () => { isOpen = !isOpen; p.classList.toggle('o', isOpen); g.classList.remove('o'); ep.classList.remove('o'); if(isOpen) i.focus(); };
    c.querySelector('#cw-c').onclick = () => { isOpen = false; p.classList.remove('o'); ep.classList.remove('o'); };
    gx.onclick = (e) => { e.stopPropagation(); g.classList.remove('o'); };
    s.onclick = () => { const t = i.value; if(t) { send(t); i.value = ''; ep.classList.remove('o'); } };
    i.onkeydown = (e) => { if(e.key==='Enter') s.click(); };
    
    // Video Modal Handlers
    const mv = c.querySelector('#cw-m-vid'), mvc = mv.querySelector('.cw-m-vid-c'), mvx = mv.querySelector('.cw-m-vid-x');
    mvx.onclick = () => { mv.classList.remove('o'); mvc.innerHTML = ''; };
    mv.onclick = (e) => { if(e.target === mv) mvx.click(); };
    window.openCwVideo = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const youtubeId = (match && match[2].length === 11) ? match[2] : null;
      
      if (youtubeId) {
        mvc.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        mv.classList.add('o');
      } else {
        window.open(url, '_blank');
      }
    };

    update();

    // Auto-show greeting after 3s
    setTimeout(() => { if(!isOpen) g.classList.add('o'); }, 3000);
  }

  function update() {
    const l = document.getElementById('cw-l'); if(!l) return;
    l.innerHTML = `<div class="cw-pill">Chat with ${config.businessName}</div>`;
    let lastPage = null;

    messages.forEach(m => {
      // Show page pill if URL changed
      if (m.pageUrl && m.pageUrl !== lastPage) {
        const pill = document.createElement('div');
        pill.className = 'cw-pill';
        try {
          const path = new URL(m.pageUrl).pathname || '/';
          pill.innerHTML = `🌐 ${path}`;
          l.appendChild(pill);
          lastPage = m.pageUrl;
        } catch(e) {}
      }

      const isOutbound = m.direction === 'outbound' || m.sender === 'admin' || m.sender === 'agent' || m.sender === 'system' || m.senderName === 'Me' || m.senderName === 'Admin';
      const isVisitor = !isOutbound;
      const t = new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      const ticks = isVisitor ? '<div class="cw-ticks"><svg viewBox="0 0 16 11" width="16" height="11" fill="currentColor"><path d="M15.01 3.31L8.07 10.25l-3.32-3.32.71-.71 2.61 2.61 6.23-6.23.71.71zm-2.82 0L5.96 9.54l-.71-.71L1.93 5.5l.71-.71 2.61 2.61 6.23-6.23.71.71z"></path></svg></div>' : '';

      // ── HANDOFF / SYSTEM ALERT ──────────────────────────────
      if (m.needsHuman || m.status === 'handoff') {
        const alert = document.createElement('div');
        alert.className = 'cw-handoff';
        alert.innerHTML = `<span style="font-size:18px">🔔</span><div><div style="font-weight:600;font-size:12px">Agent Connecting...</div><div style="font-size:11px;opacity:0.9">${(m.text || '').replace('🔔 HANDOFF REQUEST: ', '') || 'A live agent will join shortly.'}</div></div>`;
        l.appendChild(alert);
        return;
      }

      // ── NORMAL MESSAGE BUBBLE ────────────────────────────────
      const d = document.createElement('div');
      d.className = `cw-m ${isVisitor ? 'visitor' : 'admin'}`;

      // ── Interactive data from flow engine ───────────────────
      const interactive = m.interactive || {};
      const buttons = interactive.buttons || [];
      const listSections = interactive.list?.sections || [];
      const template = interactive.template;
      const flow = interactive.flow;
      const payment = interactive.payment;

      const textContent = m.text || '';
      const urlMatch = textContent.match(/https?:\/\/[^\s]+/);
      const youtubeId = urlMatch ? (function(url) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          const match = url.match(regExp);
          return (match && match[2].length === 11) ? match[2] : null;
      })(urlMatch[0]) : null;

      let msgHtml = `<span style="word-break:break-word">${textContent}</span>`;
      
      if (youtubeId) {
          msgHtml = `<div class="cw-video-wrap" onclick="window.openCwVideo('${urlMatch[0]}')"><iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>` + msgHtml;
      }

      d.innerHTML = msgHtml + `<div class="cw-msg-footer"><span class="cw-t">${t}</span>${ticks}</div>`;
      
      // ── RENDER TEMPLATE ──────────────────────────────────────
      if (!isVisitor && template) {
        d.innerHTML = ''; // Clear default text for template
        const components = template.components || [];
        const header = components.find(c => c.type === 'HEADER');
        const body = components.find(c => c.type === 'BODY');
        const footer = components.find(c => c.type === 'FOOTER');
        const btns = components.find(c => c.type === 'BUTTONS')?.buttons || [];

        if (header) {
          if (header.format === 'IMAGE' && header.example?.header_handle) {
             // For simplicity in widget, we assume media is available via some URL or handle
             const img = document.createElement('img');
             img.src = header.text || '/logo.png'; // Fallback
             img.style.width = '100%';
             img.style.borderRadius = '4px';
             img.style.marginBottom = '8px';
             d.appendChild(img);
          } else if (header.text) {
             const h = document.createElement('div');
             h.style.fontWeight = 'bold';
             h.style.marginBottom = '4px';
             h.textContent = header.text;
             d.appendChild(h);
          }
        }

        const b = document.createElement('div');
        b.textContent = body?.text || m.text;
        d.appendChild(b);

        if (footer?.text) {
          const f = document.createElement('div');
          f.style.fontSize = '11px';
          f.style.opacity = '0.6';
          f.style.marginTop = '4px';
          f.textContent = footer.text;
          d.appendChild(f);
        }

        const footerInfo = document.createElement('div');
        footerInfo.className = 'cw-msg-footer';
        footerInfo.innerHTML = `<span class="cw-t">${t}</span>${ticks}`;
        d.appendChild(footerInfo);

        if (btns.length > 0) {
          const btnWrap = document.createElement('div');
          btnWrap.className = 'cw-btn-wrap';
          btns.forEach(btn => {
            const b = document.createElement('button');
            b.className = 'cw-btn';
            b.textContent = btn.text;
            b.onclick = () => {
              if (btn.type === 'URL') {
                window.openCwVideo(btn.url);
              } else if (btn.type === 'PHONE_NUMBER') {
                window.location.href = 'tel:' + btn.phone_number;
              } else {
                send(btn.text);
                btnWrap.querySelectorAll('button').forEach(x => { x.disabled = true; });
              }
            };
            btnWrap.appendChild(b);
          });
          l.appendChild(btnWrap);
        }
      } else {
        l.appendChild(d);
      }

      // ── RENDER FLOW (FORM) ───────────────────────────────────
      if (!isVisitor && flow) {
        if (flow.structure) {
        const flowWrap = document.createElement('div');
        flowWrap.style.background = '#202c33';
        flowWrap.style.padding = '12px';
        flowWrap.style.borderRadius = '8px';
        flowWrap.style.margin = '10px 4px';
        flowWrap.style.border = '1px solid rgba(255,255,255,0.1)';
        flowWrap.style.maxWidth = '85%';

        // State tracking for multi-screen flows
        if (!window._cwFlowStates) window._cwFlowStates = {};
        if (!window._cwFlowData) window._cwFlowData = {};
        
        const msgId = m.id || m.messageId;
        if (!window._cwFlowStates[msgId]) {
          window._cwFlowStates[msgId] = flow.structure.screens?.[0]?.id || 'screen_1';
          window._cwFlowData[msgId] = {};
        }

        const currentScreenId = window._cwFlowStates[msgId];
        const screen = flow.structure.screens?.find(s => s.id === currentScreenId) || flow.structure.screens?.[0];

        if (screen) {
          const title = document.createElement('div');
          title.style.fontWeight = 'bold';
          title.style.color = 'white';
          title.style.marginBottom = '12px';
          title.style.fontSize = '14px';
          title.textContent = screen.title;
          flowWrap.appendChild(title);

          const form = document.createElement('div');
          form.style.display = 'flex';
          form.style.flexDirection = 'column';
          form.style.gap = '10px';

          const children = screen.layout?.children?.[0]?.children || screen.layout?.children || [];
          const inputs = window._cwFlowData[msgId];

          children.forEach(child => {
            if (child.type === 'TextInput') {
              const label = document.createElement('label');
              label.style.fontSize = '11px';
              label.style.color = '#8696a0';
              label.textContent = child.label;
              form.appendChild(label);

              const input = document.createElement('input');
              input.className = 'cw-i';
              input.placeholder = child.placeholder || child['helper-text'] || '';
              input.style.width = '100%';
              input.style.boxSizing = 'border-box';
              input.value = inputs[child.name] || '';
              input.oninput = (e) => { inputs[child.name] = e.target.value; };
              form.appendChild(input);
            } else if (child.type === 'Dropdown') {
               const label = document.createElement('label');
               label.style.fontSize = '11px';
               label.style.color = '#8696a0';
               label.textContent = child.label;
               form.appendChild(label);

               const select = document.createElement('select');
               select.className = 'cw-i';
               select.style.width = '100%';
               (child.options || []).forEach(opt => {
                  const o = document.createElement('option');
                  o.value = opt.id;
                  o.textContent = opt.title;
                  if (inputs[child.name] === opt.id) o.selected = true;
                  select.appendChild(o);
               });
               select.onchange = (e) => { inputs[child.name] = e.target.value; };
               form.appendChild(select);
            } else if (child.type === 'RadioButtonsGroup') {
                const label = document.createElement('label');
                label.style.fontSize = '11px';
                label.style.color = '#8696a0';
                label.textContent = child.label;
                form.appendChild(label);

                const group = document.createElement('div');
                group.style.display = 'flex';
                group.style.flexDirection = 'column';
                group.style.gap = '5px';
                (child.options || []).forEach(opt => {
                    const row = document.createElement('label');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '8px';
                    row.style.fontSize = '13px';
                    row.style.color = '#e9edef';
                    const checked = inputs[child.name] === opt.id ? 'checked' : '';
                    row.innerHTML = `<input type="radio" name="${msgId}_${child.name}" value="${opt.id}" ${checked}> ${opt.title}`;
                    row.querySelector('input').onchange = (e) => { inputs[child.name] = e.target.value; };
                    group.appendChild(row);
                });
                form.appendChild(group);
            } else if (child.type === 'CheckboxGroup') {
                const label = document.createElement('label');
                label.style.fontSize = '11px';
                label.style.color = '#8696a0';
                label.textContent = child.label;
                form.appendChild(label);

                const group = document.createElement('div');
                group.style.display = 'flex';
                group.style.flexDirection = 'column';
                group.style.gap = '5px';
                if (!inputs[child.name]) inputs[child.name] = [];
                (child.options || []).forEach(opt => {
                    const row = document.createElement('label');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '8px';
                    row.style.fontSize = '13px';
                    row.style.color = '#e9edef';
                    const checked = inputs[child.name].includes(opt.id) ? 'checked' : '';
                    row.innerHTML = `<input type="checkbox" value="${opt.id}" ${checked}> ${opt.title}`;
                    row.querySelector('input').onchange = (e) => {
                        if (e.target.checked) inputs[child.name].push(e.target.value);
                        else inputs[child.name] = inputs[child.name].filter(v => v !== e.target.value);
                    };
                    group.appendChild(row);
                });
                form.appendChild(group);
            } else if (child.type === 'TextBody') {
                const p = document.createElement('p');
                p.style.fontSize = '13px';
                p.style.color = '#e9edef';
                p.style.margin = '4px 0';
                p.textContent = child.text;
                form.appendChild(p);
            } else if (child.type === 'Image') {
                const img = document.createElement('img');
                img.src = child.src;
                img.style.width = '100%';
                img.style.borderRadius = '8px';
                img.style.marginTop = '4px';
                form.appendChild(img);
            } else if (child.type === 'Footer') {
               const subBtn = document.createElement('button');
               subBtn.className = 'cw-btn';
               subBtn.style.background = '#00a884';
               subBtn.style.color = 'white';
               subBtn.style.border = 'none';
               subBtn.style.marginTop = '8px';
               subBtn.textContent = child.label || 'Continue';
               
               const action = child['on-click-action'] || {};
               
               subBtn.onclick = async () => {
                  if (action.name === 'navigate') {
                    window._cwFlowStates[msgId] = action.next?.name || action.next || 'screen_1';
                    update(); // Re-render for next screen
                  } else {
                    // Complete / Submit
                    subBtn.disabled = true;
                    subBtn.textContent = 'Submitting...';
                    await fetch(`${API_URL}/widget/flow-submission`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        uid: userId, 
                        visitorId, 
                        flowId: flow.id, 
                        data: inputs,
                        source: 'website'
                      })
                    });
                    flowWrap.innerHTML = '<div style="color:#00a884; font-weight:bold; text-align:center; padding: 20px 0">✓ Submitted Successfully</div>';
                    delete window._cwFlowStates[msgId];
                    delete window._cwFlowData[msgId];
                    setTimeout(poll, 1500);
                  }
               };
               form.appendChild(subBtn);
            }
          });
          flowWrap.appendChild(form);
        }
        l.appendChild(flowWrap);
      } else {
        const errorWrap = document.createElement('div');
        errorWrap.style.background = 'rgba(255, 50, 50, 0.1)';
        errorWrap.style.color = '#ff6b6b';
        errorWrap.style.padding = '8px 12px';
        errorWrap.style.borderRadius = '8px';
        errorWrap.style.margin = '10px 4px';
        errorWrap.style.fontSize = '12px';
        errorWrap.style.border = '1px solid rgba(255, 50, 50, 0.2)';
        errorWrap.innerHTML = '⚠️ <b>Form Error</b><br/>This form is unavailable or deleted. Please contact support.';
        l.appendChild(errorWrap);
      }
    }

    // ── RENDER PAYMENT BUTTON ────────────────────────────────
    if (!isVisitor && payment) {
      const pWrap = document.createElement('div');
      pWrap.className = 'cw-btn-wrap';
      const pBtn = document.createElement('button');
      pBtn.className = 'cw-btn';
      pBtn.style.background = config.primaryColor;
      pBtn.style.color = 'white';
      pBtn.style.border = 'none';
      pBtn.style.boxShadow = `0 4px 12px ${config.primaryColor}40`;
      pBtn.innerHTML = `💳 Pay ${payment.currency || 'INR'} ${payment.amount}`;
      pBtn.onclick = () => {
          handleRazorpay(payment, pBtn);
      };
      pWrap.appendChild(pBtn);
      l.appendChild(pWrap);
    }

      // ── RENDER BUTTONS (from flow message node) ──────────────
      if (!isVisitor && buttons.length > 0) {
        const btnWrap = document.createElement('div');
        btnWrap.className = 'cw-btn-wrap';
        buttons.forEach(btn => {
          const b = document.createElement('button');
          b.className = 'cw-btn';
          b.textContent = btn.label || btn.title || btn.id || 'Option';
          b.onclick = () => {
            if (btn.url) {
              window.openCwVideo(btn.url);
            } else {
              send(b.textContent);
            }
            btnWrap.querySelectorAll('button').forEach(x => { x.disabled = true; });
          };
          btnWrap.appendChild(b);
        });
        l.appendChild(btnWrap);
      }

      // ── RENDER LIST OPTIONS (from flow list node) ────────────
      if (!isVisitor && listSections.length > 0) {
        const listWrap = document.createElement('div');
        listWrap.className = 'cw-list-wrap';
        listSections.forEach(section => {
          if (section.title) {
            const t = document.createElement('div');
            t.className = 'cw-list-sec';
            t.textContent = section.title;
            listWrap.appendChild(t);
          }
          (section.rows || []).forEach(row => {
            const item = document.createElement('button');
            item.className = 'cw-list-item';
            item.innerHTML = `<span style="font-weight:500">${row.title || row.id}</span>${row.description ? `<span style="font-size:11px;color:#8696a0">${row.description}</span>` : ''}`;
            item.onclick = () => {
              if (row.url) {
                window.openCwVideo(row.url);
              } else {
                send(row.title || row.id);
              }
              listWrap.querySelectorAll('button').forEach(x => { x.disabled = true; });
            };
            listWrap.appendChild(item);
          });
        });
        l.appendChild(listWrap);
      }
    });
    l.scrollTop = l.scrollHeight;
  }
  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  async function handleRazorpay(payment, btn) {
    btn.disabled = true;
    btn.textContent = 'Preparing...';
    
    // 1. Ensure Razorpay is loaded
    if (!window.Razorpay) {
        await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    }

    try {
        // 2. Create Order/Subscription on Backend
        const res = await fetch(`${API_URL}/payments/razorpay/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: payment.amount,
                currency: payment.currency,
                description: payment.description,
                paymentType: payment.paymentType,
                planId: payment.planId,
                uid: userId,
                customerInfo: { visitorId }
            })
        });
        const order = await res.json();
        if (!res.ok) throw new Error(order.error);

        // 3. Open Razorpay Checkout
        const options = {
            key: order.key,
            name: config.businessName || "ChatWiz",
            description: payment.description,
            handler: async function (response) {
                btn.textContent = 'Verifying...';
                const vRes = await fetch(`${API_URL}/payments/razorpay/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...response,
                        uid: userId
                    })
                });
                const vData = await vRes.json();
                if (vData.success) {
                    btn.style.background = '#00a884';
                    btn.innerHTML = '✓ ' + (payment.paymentType === 'subscription' ? 'Subscribed' : 'Paid') + ' Successfully';
                    send(`Payment Successful: ${order.id}`);
                } else {
                    btn.disabled = false;
                    btn.textContent = 'Verification Failed';
                }
            },
            modal: {
                ondismiss: function() {
                    btn.disabled = false;
                    btn.textContent = 'Pay Now';
                }
            },
            theme: { color: config.themeColor || '#3395FF' }
        };

        if (payment.paymentType === 'subscription') {
            options.subscription_id = order.id;
        } else {
            options.amount = order.amount;
            options.currency = order.currency;
            options.order_id = order.id;
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch (e) {
        console.error(e);
        btn.disabled = false;
        btn.textContent = 'Error: ' + e.message;
    }
  }

  init();
})();
