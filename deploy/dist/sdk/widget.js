console.log('[ChatWizs] Script loaded');
const script = document.currentScript || Array.from(document.getElementsByTagName('script')).find(s => s.src.includes('widget.js'));
const widgetId = script ? script.getAttribute('data-id') : 'global';
const API_BASE = (script && script.src.includes('http')) ? script.src.split('/sdk/')[0] : window.location.origin;

let settings = null;
let isOpen = false;
let visitorId = localStorage.getItem('chatwizs_visitor_id');
if (!visitorId) {
    visitorId = 'vis_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('chatwizs_visitor_id', visitorId);
}

// Styles
const style = document.createElement('style');
style.innerHTML = `
    .cw-widget-container { 
        position: fixed !important; 
        z-index: 2147483647 !important; 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        display: flex !important; 
        flex-direction: column !important; 
        align-items: flex-end !important;
        gap: 12px !important;
        pointer-events: none !important;
        bottom: 20px !important;
        right: 20px !important;
        width: auto !important;
        height: auto !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: none !important;
    }
    .cw-widget-container.bottom-left { 
        right: auto !important;
        left: 20px !important; 
        align-items: flex-start !important; 
    }
    
    .cw-bubble { 
        width: 60px !important; 
        height: 60px !important; 
        min-width: 60px !important;
        min-height: 60px !important;
        border-radius: 50% !important; 
        cursor: pointer !important; 
        display: flex !important; 
        align-items: center !important; 
        justify-content: center !important; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important; 
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease !important;
        background: #6366f1 !important; 
        color: white !important;
        order: 10 !important;
        pointer-events: auto !important;
        position: relative !important;
        z-index: 2147483647 !important;
        visibility: visible !important;
        opacity: 1 !important;
        -webkit-tap-highlight-color: transparent !important;
        user-select: none !important;
    }
    .cw-bubble:hover { transform: scale(1.05) !important; }
    .cw-bubble svg { width: 30px !important; height: 30px !important; fill: white !important; display: block !important; }

    .cw-window {
        width: 380px !important; 
        height: 600px !important; 
        max-height: calc(100vh - 100px) !important;
        background: white !important; 
        border-radius: 20px !important; 
        overflow: hidden !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important; 
        display: none !important; 
        flex-direction: column !important;
        transition: all 0.3s ease !important;
        order: 1 !important;
        position: relative !important;
        pointer-events: auto !important;
        border: 1px solid #e2e8f0 !important;
    }
    .cw-window.open { display: flex !important; animation: cw-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
    
    @keyframes cw-pop {
        from { opacity: 0; transform: scale(0.9) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .cw-header { padding: 20px !important; color: white !important; display: flex !important; align-items: center !important; gap: 12px !important; box-sizing: border-box !important; position: relative !important; }
    .cw-header-avatar { width: 44px !important; height: 44px !important; border-radius: 50% !important; background: rgba(255,255,255,0.2) !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: bold !important; font-size: 20px !important; flex-shrink: 0 !important; }
    .cw-header-info { flex: 1 !important; overflow: hidden !important; }
    .cw-header-name { font-weight: 700 !important; font-size: 16px !important; display: block !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
    .cw-header-status { font-size: 12px !important; opacity: 0.9 !important; display: flex !important; align-items: center !important; gap: 6px !important; }
    .cw-status-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; background: #22c55e !important; border: 1.5px solid rgba(255,255,255,0.2) !important; }

    .cw-messages { flex: 1 !important; padding: 20px !important; overflow-y: auto !important; background: #f8fafc !important; display: flex !important; flex-direction: column !important; gap: 12px !important; box-sizing: border-box !important; }
    .cw-msg { max-width: 85% !important; padding: 12px 16px !important; border-radius: 18px !important; font-size: 14px !important; line-height: 1.5 !important; box-sizing: border-box !important; }
    .cw-msg.bot { align-self: flex-start !important; background: white !important; color: #1e293b !important; border-bottom-left-radius: 4px !important; box-shadow: 0 2px 5px rgba(0,0,0,0.05) !important; border: 1px solid #f1f5f9 !important; }
    .cw-msg.user { align-self: flex-end !important; background: #6366f1 !important; color: white !important; border-bottom-right-radius: 4px !important; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2) !important; }

    .cw-input-area { padding: 15px !important; border-top: 1px solid #f1f5f9 !important; display: flex !important; gap: 10px !important; background: white !important; box-sizing: border-box !important; }
    .cw-input { flex: 1 !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; padding: 10px 14px !important; outline: none !important; font-size: 14px !important; transition: border 0.2s !important; display: block !important; box-sizing: border-box !important; background: #f8fafc !important; }
    .cw-input:focus { border-color: #6366f1 !important; background: white !important; }
    .cw-send-btn { width: 40px !important; height: 40px !important; border-radius: 12px !important; background: #6366f1 !important; color: white !important; border: none !important; cursor: pointer !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; transition: transform 0.2s !important; }
    .cw-send-btn:active { transform: scale(0.95) !important; }
    .cw-send-btn svg { width: 22px !important; height: 22px !important; fill: white !important; }

    .cw-powered { font-size: 11px !important; text-align: center !important; padding: 10px !important; color: #94a3b8 !important; background: #f8fafc !important; display: block !important; border-top: 1px solid #f1f5f9 !important; }
    .cw-powered a { color: #6366f1 !important; text-decoration: none !important; font-weight: 600 !important; }

    .cw-notification {
        background: white !important; padding: 12px 16px !important; border-radius: 15px !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; font-size: 14px !important; color: #334155 !important;
        max-width: 250px !important; position: relative !important; animation: cw-pop 0.5s ease !important;
        display: none !important; cursor: pointer !important; border: 1px solid #f1f5f9 !important;
        order: 5 !important; pointer-events: auto !important; margin-bottom: 5px !important;
    }
    .cw-notification::after {
        content: '' !important; position: absolute !important; bottom: -8px !important; right: 24px !important;
        border-left: 8px solid transparent !important; border-right: 8px solid transparent !important; border-top: 8px solid white !important;
    }
    .cw-notification-close {
        position: absolute !important; top: -8px !important; right: -8px !important; background: #ef4444 !important; 
        color: white !important; width: 22px !important; height: 22px !important; border-radius: 50% !important; 
        display: flex !important; align-items: center !important; justify-content: center !important; 
        font-size: 12px !important; cursor: pointer !important; font-weight: bold !important; 
        border: 2px solid white !important; box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
    }
    .cw-badge {
        position: absolute !important; top: -5px !important; right: -5px !important;
        background: #ef4444 !important; color: white !important; font-size: 11px !important; font-weight: 700 !important;
        width: 22px !important; height: 22px !important; border-radius: 50% !important; display: none !important;
        align-items: center !important; justify-content: center !important; border: 2px solid white !important;
        z-index: 1000000000 !important; box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
    }

    @media screen and (max-width: 480px) {
        .cw-widget-container { bottom: 15px !important; right: 15px !important; gap: 8px !important; transition: all 0.3s ease !important; }
        .cw-widget-container.open { bottom: 0 !important; right: 0 !important; left: 0 !important; top: 0 !important; width: 100vw !important; height: 100vh !important; gap: 0 !important; pointer-events: none !important; }
        .cw-bubble { width: 56px !important; height: 56px !important; min-width: 56px !important; min-height: 56px !important; pointer-events: auto !important; z-index: 2147483647 !important; }
        .cw-widget-container.open .cw-bubble { position: fixed !important; bottom: 15px !important; right: 15px !important; }
        .cw-widget-container.open.bottom-left .cw-bubble { right: auto !important; left: 15px !important; }
        
        .cw-window {
            width: 100vw !important; height: calc(100vh - 60px) !important;
            max-height: calc(100vh - 60px) !important; bottom: 0 !important; right: 0 !important;
            position: fixed !important; border-top-left-radius: 25px !important; border-top-right-radius: 25px !important;
            border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important;
            z-index: 2147483646 !important; border: none !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.1) !important;
            top: 60px !important;
        }
        .cw-notification { max-width: 200px !important; font-size: 13px !important; }
    }
`;
document.head.appendChild(style);

const initWidget = () => {
    console.log('[ChatWizs] Initializing widget...');
    if (document.getElementById('cw-widget-container')) return;

    const container = document.createElement('div');
    container.id = 'cw-widget-container';
    container.className = 'cw-widget-container';
    container.innerHTML = `
        <div class="cw-window" id="cw-window">
            <div class="cw-header" id="cw-header">
                <div class="cw-header-avatar" id="cw-avatar">?</div>
                <div class="cw-header-info">
                    <div class="cw-header-name" id="cw-name">Support</div>
                    <div class="cw-header-status"><div class="cw-status-dot"></div> Online</div>
                </div>
            </div>
            <div class="cw-messages" id="cw-messages"></div>
            <div class="cw-input-area">
                <input type="text" class="cw-input" id="cw-input" placeholder="Type a message...">
                <button class="cw-send-btn" id="cw-send">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
            <div class="cw-powered">Powered by <a href="https://chatwizs.com" target="_blank">ChatWizs</a></div>
        </div>
        <div class="cw-notification" id="cw-notification">
            <div id="cw-notification-text">Hi! How can we help you today?</div>
            <div class="cw-notification-close" id="cw-notification-close">✕</div>
        </div>
        <div class="cw-bubble" id="cw-bubble">
            <div class="cw-badge" id="cw-badge">0</div>
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
    `;
    document.body.appendChild(container);

    const windowEl = document.getElementById('cw-window'),
          bubbleEl = document.getElementById('cw-bubble'),
          inputEl = document.getElementById('cw-input'),
          sendBtn = document.getElementById('cw-send'),
          messagesEl = document.getElementById('cw-messages'),
          badgeEl = document.getElementById('cw-badge'),
          notifEl = document.getElementById('cw-notification');

    const ICONS = {
        MessageSquare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        Sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>',
        Zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.5 14 3l-2.5 8.5H20L10 21l2.5-8.5H4z"></path></svg>',
        Smartphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>'
    };

    function applySettings() {
        const s = settings || {};
        container.classList.toggle('bottom-left', s.position === 'left' || s.position === 'bottom-left');
        bubbleEl.style.backgroundColor = s.bubbleColor || s.primaryColor || '#6366f1';
        bubbleEl.style.color = s.iconColor || '#ffffff';
        
        if (window.innerWidth > 480) {
            const size = s.bubbleSize || 60;
            ['width', 'height', 'min-width', 'min-height'].forEach(p => bubbleEl.style.setProperty(p, `${size}px`, 'important'));
            bubbleEl.style.fontSize = `${size * 0.4}px`;
        }

        // Apply Icon
        const iconName = s.bubbleIcon || 'MessageSquare';
        const iconSvg = ICONS[iconName] || ICONS.MessageSquare;
        
        // Update bubble icon
        const currentIcon = bubbleEl.querySelector('svg');
        if (currentIcon) {
            bubbleEl.innerHTML = `<div class="cw-badge" id="cw-badge">0</div>${iconSvg}`;
        }

        // Update send button icon color
        const sendSvg = sendBtn.querySelector('svg');
        if (sendSvg) {
            sendBtn.style.color = s.iconColor || '#ffffff';
            sendBtn.style.backgroundColor = s.primaryColor || '#6366f1';
        }
        
        let bg = s.primaryColor || '#6366f1';
        if ((s.useGradient || s.themeStyle === 'gradient') && s.gradientColor) bg = `linear-gradient(135deg, ${s.primaryColor}, ${s.gradientColor})`;
        document.getElementById('cw-header').style.background = bg;
        document.getElementById('cw-header').style.color = s.secondaryColor || '#ffffff';
        document.getElementById('cw-name').innerText = s.businessName || 'Support';
        document.getElementById('cw-notification-text').innerText = s.greeting || s.welcomeMessage || 'Hi! How can we help you today?';
        
        if (!isOpen && !localStorage.getItem('cw_notif_closed')) {
            setTimeout(() => { if (!isOpen) notifEl.style.setProperty('display', 'block', 'important'); }, 3000);
        }

        const avatarEl = document.getElementById('cw-avatar');
        if (s.avatarUrl && s.avatarUrl !== '/logo.png') avatarEl.innerHTML = `<img src="${s.avatarUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        else avatarEl.innerText = (s.businessName || 'S')[0].toUpperCase();

        if (s.theme === 'glass') {
            windowEl.style.backdropFilter = 'blur(10px)';
            windowEl.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        }
        container.style.setProperty('display', s.isEnabled !== false && s.enabled !== false ? 'flex' : 'none', 'important');
    }

    let renderedMessageIds = new Set();
    let isPolling = false;
    let pollInterval = 3000;
    let lastActivity = Date.now();
    let pollTimer = null;

    const updateActivity = () => { 
        lastActivity = Date.now(); 
        if (!pollTimer && !isOpen) startPolling(); 
    };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);

    function addMessage(text, type, id = null, interactive = null) {
        if (id && renderedMessageIds.has(id)) return false;
        if (id) renderedMessageIds.add(id);
        
        const msgContainer = document.createElement('div');
        msgContainer.style.display = 'contents';
        const msg = document.createElement('div');
        msg.className = `cw-msg ${type}`;
        msg.innerText = text;
        msgContainer.appendChild(msg);

        if (interactive && type === 'bot') {
            const options = document.createElement('div');
            options.style.cssText = 'display:flex; flex-direction:column; gap:6px; margin-top:4px; align-self:flex-start; max-width:80%; pointer-events:auto;';
            if (interactive.buttons) interactive.buttons.forEach(b => options.appendChild(createOption(b.label || b.title, b.id, null, b.url)));
            if (interactive.list && interactive.list.sections) interactive.list.sections.forEach(s => s.rows.forEach(r => options.appendChild(createOption(r.title, r.id, r.description))));
            if (interactive.flow) options.appendChild(createActionButton(interactive.flow.cta || 'Open Form', () => openOverlay('flow', interactive.flow)));
            if (interactive.video) options.appendChild(createActionButton('Watch Video', () => openOverlay('video', interactive.video.url)));
            if (options.children.length > 0) msgContainer.appendChild(options);
        }
        messagesEl.appendChild(msgContainer);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return true;
    }

    function createActionButton(label, onclick) {
        const btn = document.createElement('div');
        btn.style.cssText = 'padding:10px 16px; background:#6366f1; color:white; border-radius:12px; font-size:13px; cursor:pointer; font-weight:bold; text-align:center; box-shadow:0 4px 12px rgba(99, 102, 241, 0.2);';
        btn.innerText = label;
        btn.onclick = onclick;
        return btn;
    }

    function openOverlay(type, data) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; inset:0; background:white; z-index:1000; display:flex; flex-direction:column; animation:cw-pop 0.3s ease; pointer-events:auto;';
        if (type === 'video') {
            overlay.style.background = 'black';
            let url = data;
            if (url.includes('youtu.be/')) url = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0];
            else if (url.includes('watch?v=')) url = 'https://www.youtube.com/embed/' + url.split('v=')[1].split('&')[0];
            overlay.innerHTML = `<div style="padding:12px; display:flex; align-items:center; justify-content:space-between; background:#1a1a1a; color:white;"><div style="font-weight:bold; font-size:14px;">Video</div><div class="cw-close-overlay" style="cursor:pointer; padding:4px;">✕</div></div>
                                <div style="flex:1; display:flex; align-items:center;"><iframe src="${url}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%; height:200px;"></iframe></div>`;
        } else {
            overlay.innerHTML = `<div style="padding:16px; border-bottom:1px solid #eee; display:flex; align-items:center; justify-content:space-between;"><div style="font-weight:bold; font-size:14px;">${data.cta || 'Form'}</div><div class="cw-close-overlay" style="cursor:pointer; padding:4px;">✕</div></div>
                                <div id="cw-flow-content" style="flex:1; overflow-y:auto; padding:20px;"></div>
                                <div style="padding:16px; border-top:1px solid #eee;"><button id="cw-submit-flow" style="width:100%; padding:12px; background:#6366f1; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">Submit</button></div>`;
            const content = overlay.querySelector('#cw-flow-content'), state = {}, screen = data.structure.screens.find(s => s.id === data.screen) || data.structure.screens[0];
            const render = (children) => {
                children.forEach(c => {
                    const el = document.createElement('div'); el.style.marginBottom = '16px';
                    if (c.type === 'TextHeading') el.innerHTML = `<div style="font-weight:bold; font-size:18px; color:#1e293b;">${c.text}</div>`;
                    else if (c.type === 'TextBody') el.innerHTML = `<div style="font-size:14px; color:#64748b; margin-top:4px;">${c.text}</div>`;
                    else if (c.type === 'TextInput') {
                        el.innerHTML = `<label style="display:block; font-size:12px; font-weight:bold; color:#64748b; margin-bottom:6px;">${c.label}</label><input type="${c['input-type']==='number'?'number':'text'}" style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none; font-size:14px; display:block; box-sizing:border-box;">`;
                        el.querySelector('input').oninput = (e) => state[c.name] = e.target.value;
                    } else if (c.type === 'Dropdown') {
                        let opts = (c['data-source'] || []).map(o => `<option value="${o.id}">${o.title}</option>`).join('');
                        el.innerHTML = `<label style="display:block; font-size:12px; font-weight:bold; color:#64748b; margin-bottom:6px;">${c.label}</label><select style="width:100%; padding:10px; border:1px solid #e2e8f0; border-radius:8px; outline:none; font-size:14px; background:white; display:block; box-sizing:border-box;"><option value="">Select an option</option>${opts}</select>`;
                        el.querySelector('select').onchange = (e) => state[c.name] = e.target.value;
                    } else if (c.children) render(c.children);
                    if (el.innerHTML) content.appendChild(el);
                });
            };
            if (screen.layout?.children) render(screen.layout.children);
            overlay.querySelector('#cw-submit-flow').onclick = async () => {
                overlay.querySelector('#cw-submit-flow').innerText = 'Submitting...';
                await sendMessage('Form Submitted', null, state);
                overlay.remove();
            };
        }
        overlay.querySelector('.cw-close-overlay').onclick = () => overlay.remove();
        windowEl.appendChild(overlay);
    }

    function createOption(title, id, description = null, url = null) {
        const btn = document.createElement('div');
        btn.style.cssText = 'padding:8px 12px; background:white; border:1px solid #e2e8f0; border-radius:10px; font-size:13px; cursor:pointer; transition:all 0.2s; color:#6366f1; font-weight:500; box-shadow:0 2px 4px rgba(0,0,0,0.02); pointer-events:auto;';
        btn.innerHTML = `<div>${title}</div>${description ? `<div style="font-size:11px; color:#94a3b8; font-weight:normal; margin-top:2px;">${description}</div>` : ''}`;
        btn.onclick = () => url ? window.open(url, '_blank') : sendMessage(title, id);
        return btn;
    }

    async function sendMessage(text, interactiveId = null, submissionData = null) {
        if (!text) return;
        updateActivity();
        try {
            const payload = { widgetId, visitorId, text };
            if (interactiveId) payload.interactiveId = interactiveId;
            if (submissionData) payload.submissionData = submissionData;
            const res = await fetch(`${API_BASE}/api/public/widget/message`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res.ok) {
                const all = messagesEl.querySelectorAll('div[style*="cursor: pointer"]');
                all.forEach(o => o.parentElement.remove());
                pollInterval = 1000; // Fast poll after sending
                setTimeout(pollMessages, 100); 
            }
        } catch (err) { console.error('[ChatWizs] Send Error:', err); }
    }

    async function pollMessages() {
        if (isPolling) return;
        
        // Inactivity Check: Stop polling if no activity for 5 minutes
        if (Date.now() - lastActivity > 300000 && !isOpen) {
            if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
            return;
        }

        isPolling = true;
        try {
            const res = await fetch(`${API_BASE}/api/public/widget/messages/${widgetId}/${visitorId}`);
            if (res.ok) {
                const msgs = await res.json();
                let unreadCount = 0; let unreadIds = []; let newMsgsFound = false;
                
                msgs.forEach(m => {
                    const isNew = !renderedMessageIds.has(m.id || m.timestamp);
                    if (isNew) newMsgsFound = true;
                    if ((m.unread === true || m.unread === 'true') && m.sender !== 'visitor') { unreadCount++; unreadIds.push(m.id); }
                    if (isOpen || !isNew) addMessage(m.text, m.sender === 'visitor' ? 'user' : 'bot', m.id || m.timestamp, m.interactive);
                });

                if (!isOpen) {
                    badgeEl.innerText = unreadCount;
                    badgeEl.style.setProperty('display', unreadCount > 0 ? 'flex' : 'none', 'important');
                } else if (unreadIds.length > 0) {
                    markAsRead(unreadIds);
                }

                // Exponential Backoff: If no new messages, increase interval
                if (!newMsgsFound) {
                    pollInterval = Math.min(pollInterval + 2000, 10000); // Max 10s
                } else {
                    pollInterval = 3000; // Reset to 3s if new messages found
                }
                
                // Reschedule with new interval
                if (pollTimer) { clearInterval(pollTimer); pollTimer = setInterval(pollMessages, pollInterval); }

            }
        } catch (err) {} finally { isPolling = false; }
    }

    function startPolling() {
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(pollMessages, pollInterval);
    }

    async function markAsRead(messageIds) {
        try { await fetch(`${API_BASE}/api/public/widget/messages/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageIds }) }); } catch (err) {}
    }

    function toggleWindow() {
        isOpen = !isOpen;
        windowEl.classList.toggle('open', isOpen);
        container.classList.toggle('open', isOpen);
        updateActivity();
        
        if (isOpen) {
            document.getElementById('cw-notification').style.setProperty('display', 'none', 'important');
            document.getElementById('cw-badge').style.setProperty('display', 'none', 'important');
            
            // Show close icon
            bubbleEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            
            pollInterval = 3000;
            startPolling();
            pollMessages();
        } else {
            applySettings(); // Reverts icon
        }
    }

    bubbleEl.onclick = toggleWindow;
    bubbleEl.addEventListener('touchstart', (e) => { e.preventDefault(); toggleWindow(); }, { passive: false });

    sendBtn.onclick = async () => {
        const text = inputEl.value.trim(); if (!text) return;
        inputEl.value = ''; await sendMessage(text);
    };
    inputEl.onkeypress = (e) => { if (e.key === 'Enter') sendBtn.click(); };

    document.getElementById('cw-notification').onclick = () => { if (!isOpen) toggleWindow(); };
    document.getElementById('cw-notification-close').onclick = (e) => {
        e.stopPropagation(); document.getElementById('cw-notification').style.setProperty('display', 'none', 'important');
        localStorage.setItem('cw_notif_closed', 'true');
    };

    startPolling();
    fetch(`${API_BASE}/api/public/widget/settings/${widgetId}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => { 
            settings = data; applySettings(); 
            if (renderedMessageIds.size === 0) addMessage(settings.greeting || 'Hello! How can we help you?', 'bot'); 
        })
        .catch(() => applySettings());
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initWidget);
else initWidget();
