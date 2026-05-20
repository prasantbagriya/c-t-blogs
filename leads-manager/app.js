const token = localStorage.getItem('inquiry_token');
let allLeads = [];
let currentLead = null;

if (!token) {
    window.location.href = 'index.html';
}

async function fetchLeads() {
    try {
        const response = await fetch('/api/inquiries/list', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('inquiry_token');
            window.location.href = 'index.html';
            return;
        }

        allLeads = await response.json();
        renderLeads(allLeads);
        updateStats(allLeads);
    } catch (err) {
        console.error('Error fetching leads:', err);
    }
}

function updateStats(leads) {
    document.getElementById('totalCount').innerText = leads.length;
    document.getElementById('newCount').innerText = leads.filter(l => l.status === 'new').length;
    document.getElementById('contactedCount').innerText = leads.filter(l => l.status === 'contacted').length;
}

function renderLeads(leads) {
    const body = document.getElementById('leadsBody');
    body.innerHTML = '';

    if (leads.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">No inquiries found.</td></tr>';
        return;
    }

    leads.forEach(lead => {
        const tr = document.createElement('tr');
        const date = new Date(lead.timestamp).toLocaleDateString();
        const time = new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        tr.innerHTML = `
            <td>
                <div style="font-weight: 600;">${date}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${time}</div>
            </td>
            <td>
                <div style="font-weight: 600;">${lead.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${lead.source}</div>
            </td>
            <td>
                <div>${lead.email}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${lead.phone}</div>
            </td>
            <td><span style="text-transform: capitalize;">${lead.type}</span></td>
            <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
            <td>
                <button class="btn-icon view-btn" data-id="${lead.id}"><i class="fa-solid fa-chevron-right"></i></button>
                <button class="btn-icon delete-btn" data-id="${lead.id}" style="color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        body.appendChild(tr);
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => openPanel(leads.find(l => l.id === btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deleteLead(btn.dataset.id);
    });
}

function openPanel(lead) {
    currentLead = lead;
    document.getElementById('panelName').innerText = lead.name;
    document.getElementById('panelSource').innerText = lead.source;
    document.getElementById('panelEmail').innerText = lead.email || 'N/A';
    document.getElementById('panelPhone').innerText = lead.phone || 'N/A';
    document.getElementById('panelMessage').innerText = lead.message || 'No message provided.';
    
    // Reset tabs
    switchTab('info');
    document.getElementById('ticketSuccess').style.display = 'none';
    document.getElementById('ticketForm').style.display = 'flex';
    document.getElementById('ticketIssue').value = lead.message || '';

    // Status button
    const markBtn = document.getElementById('markContacted');
    if (lead.status === 'contacted') {
        markBtn.innerText = 'Contacted';
        markBtn.disabled = true;
        markBtn.style.opacity = '0.5';
    } else {
        markBtn.innerText = 'Mark Contacted';
        markBtn.disabled = false;
        markBtn.style.opacity = '1';
        markBtn.onclick = () => updateStatus(lead.id, 'contacted');
    }

    // Open chat link (assuming WhatsApp)
    document.getElementById('openChat').onclick = () => {
        const phone = lead.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
    };

    // Show panel
    document.getElementById('sidePanel').classList.add('open');
    document.getElementById('panelOverlay').style.display = 'block';

    // Load History
    loadHistory(lead);
}

function closePanel() {
    document.getElementById('sidePanel').classList.remove('open');
    document.getElementById('panelOverlay').style.display = 'none';
    currentLead = null;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = content.id === tabId + 'Tab' ? 'block' : 'none';
    });
}

function loadHistory(lead) {
    const timeline = document.getElementById('historyTimeline');
    timeline.innerHTML = '';
    
    // Find all leads with same phone or email
    const history = allLeads.filter(l => 
        (l.phone && l.phone === lead.phone) || 
        (l.email && l.email === lead.email)
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (history.length === 0) {
        timeline.innerHTML = '<p style="color: var(--text-muted); font-size: 0.875rem; text-align: center;">No previous history found.</p>';
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        const date = new Date(item.timestamp).toLocaleString();
        div.innerHTML = `
            <div class="history-date">${date}</div>
            <div class="history-text">
                <strong style="color: var(--primary)">${item.type.toUpperCase()}</strong> via ${item.source}<br>
                ${item.message || 'No message'}
            </div>
        `;
        timeline.appendChild(div);
    });
}

// Ticket Form Logic
document.getElementById('ticketForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('createTicketBtn');
    const issue = document.getElementById('ticketIssue').value;
    const altPhone = document.getElementById('ticketAltPhone').value;
    const eta = document.getElementById('ticketEta').value;

    btn.disabled = true;
    btn.innerText = 'Creating Ticket...';

    try {
        const response = await fetch('/api/inquiries/ticket', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                leadId: currentLead.id,
                name: currentLead.name,
                phone: currentLead.phone,
                issue,
                altPhone,
                eta
            })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('ticketForm').style.display = 'none';
            document.getElementById('ticketSuccess').style.display = 'block';
            document.getElementById('generatedTicketId').innerText = data.ticketId;
        } else {
            alert(data.error || 'Failed to create ticket');
        }
    } catch (err) {
        alert('Connection error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Generate Ticket & Send WhatsApp';
    }
};

async function updateStatus(id, status) {
    try {
        const response = await fetch(`/api/inquiries/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        if (response.ok) {
            closePanel();
            fetchLeads();
        }
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
        const response = await fetch(`/api/inquiries/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) fetchLeads();
    } catch (err) {
        console.error('Error deleting lead:', err);
    }
}

// Event Listeners
document.getElementById('closePanel').onclick = closePanel;
document.getElementById('panelOverlay').onclick = closePanel;

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.tab);
});

document.getElementById('logoutBtn').onclick = logout;
document.getElementById('logoutSide').onclick = (e) => { e.preventDefault(); logout(); };

function logout() {
    localStorage.removeItem('inquiry_token');
    window.location.href = 'index.html';
}

// Initial fetch
fetchLeads();
setInterval(fetchLeads, 30000);
