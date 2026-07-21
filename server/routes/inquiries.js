import express from 'express';
import { getCollection, addDoc, deleteDoc, updateDoc, getDoc } from '../db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

const router = express.Router();

// Simple Admin Login for Inquiry Manager
// In a real app, this would check against a user DB, but for "independent" folder, 
// we can have a hardcoded or env-based admin or just use the main user DB.
// The user asked for "admin login aor pass bana lo".
const ADMIN_USER = process.env.INQUIRY_ADMIN_USER;
const ADMIN_PASS = process.env.INQUIRY_ADMIN_PASS;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (ADMIN_USER && ADMIN_PASS && email === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ email, role: 'inquiry_admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, token });
  }
  res.status(401).json({ error: 'Invalid credentials or service unconfigured' });
});

// Middleware to protect admin routes
function authenticateAdmin(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'inquiry_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = decoded;
    next();
  });
}

// PUBLIC endpoint for collecting inquiries from external sites (theme_migration)
router.post('/collect', async (req, res) => {
  try {
    const { name, email, phone, message, source, type } = req.body;
    
    const inquiry = {
      name: name || 'Anonymous',
      email: email || '',
      phone: phone || '',
      message: message || '',
      source: source || 'external',
      type: type || 'general', // newsletter, contact, service, etc.
      status: 'new',
      timestamp: new Date().toISOString()
    };

    const result = await addDoc('external_inquiries', inquiry);
    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PROTECTED Admin Routes
router.get('/list', authenticateAdmin, async (req, res) => {
  try {
    const inquiries = await getCollection('external_inquiries');
    res.json(inquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const result = await updateDoc('external_inquiries', id, update);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDoc('external_inquiries', id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TICKET GENERATION
router.post('/ticket', authenticateAdmin, async (req, res) => {
  try {
    const { leadId, name, phone, issue, altPhone, eta } = req.body;
    
    // Generate a unique Ticket ID
    const ticketId = `CW-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const ticket = {
      ticketId,
      leadId,
      customerName: name,
      customerPhone: phone,
      issue,
      altPhone: altPhone || '',
      eta,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    // Save ticket to DB
    await addDoc('tickets', ticket);
    
    // Update lead status
    await updateDoc('external_inquiries', leadId, { status: 'ticket_created', ticketId });

    // MOCK: Send WhatsApp Template via Meta API
    // In a real scenario, we would call the Meta API here
    console.log(`[WhatsApp API] Sending Ticket ${ticketId} to ${phone}`);
    
    // Return the generated ticket ID
    res.status(201).json({ success: true, ticketId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
