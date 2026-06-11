import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Define paths
const DATA_DIR = path.join(__dirname, '../data');
const PLAYBOOKS_FILE = path.join(DATA_DIR, 'playbooks.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Get UPLOAD_DIR dynamically
import { UPLOAD_DIR } from '../config.js';

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `playbook-media-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper functions for reading/writing data
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile(filePath, defaultData = []) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaultData;
    }
    throw error;
  }
}

async function writeJsonFile(filePath, data) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Playbook Items API ---

router.get('/items', async (req, res) => {
  try {
    const items = await readJsonFile(PLAYBOOKS_FILE);
    res.json(items);
  } catch (error) {
    console.error('Error reading playbooks:', error);
    res.status(500).json({ error: 'Failed to fetch playbooks' });
  }
});

router.post('/items', async (req, res) => {
  try {
    const items = await readJsonFile(PLAYBOOKS_FILE);
    const newItem = {
      ...req.body,
      id: req.body.id || crypto.randomUUID(),
      createdAt: req.body.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    items.push(newItem);
    await writeJsonFile(PLAYBOOKS_FILE, items);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating playbook:', error);
    res.status(500).json({ error: 'Failed to create playbook' });
  }
});

router.put('/items/:id', async (req, res) => {
  try {
    const items = await readJsonFile(PLAYBOOKS_FILE);
    const index = items.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Playbook not found' });
    }
    
    items[index] = { ...items[index], ...req.body, updatedAt: Date.now() };
    await writeJsonFile(PLAYBOOKS_FILE, items);
    res.json(items[index]);
  } catch (error) {
    console.error('Error updating playbook:', error);
    res.status(500).json({ error: 'Failed to update playbook' });
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    const items = await readJsonFile(PLAYBOOKS_FILE);
    const itemToDelete = items.find(i => i.id === req.params.id);
    const filteredItems = items.filter(i => i.id !== req.params.id);
    
    if (items.length === filteredItems.length) {
      return res.status(404).json({ error: 'Playbook not found' });
    }
    
    // Optionally delete files from filesystem
    if (itemToDelete) {
      const urls = [itemToDelete.fileUrl, itemToDelete.imageUrl].filter(Boolean);
      for (const url of urls) {
        if (url.startsWith('/uploads/')) {
          const filename = path.basename(url);
          const filepath = path.join(UPLOAD_DIR, filename);
          try {
             await fs.access(filepath);
             await fs.unlink(filepath);
          } catch (err) {
             // Ignore if file doesn't exist
          }
        }
      }
    }
    
    await writeJsonFile(PLAYBOOKS_FILE, filteredItems);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting playbook:', error);
    res.status(500).json({ error: 'Failed to delete playbook' });
  }
});

// --- File Upload API ---

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Return the public URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, success: true });
});

// --- Leads API ---

router.get('/leads', async (req, res) => {
  try {
    const leads = await readJsonFile(LEADS_FILE);
    res.json(leads);
  } catch (error) {
    console.error('Error reading leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const leads = await readJsonFile(LEADS_FILE);
    const newLead = {
      ...req.body,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    leads.push(newLead);
    await writeJsonFile(LEADS_FILE, leads);
    
    // --- Send email to the lead ---
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.chatwizs.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER || 'support@chatwizs.com',
          pass: process.env.SMTP_PASS
        }
      });

      const playbooks = await readJsonFile(PLAYBOOKS_FILE);
      const playbook = playbooks.find(p => p.id === newLead.playbookId);
      
      if (playbook && newLead.email) {
        const downloadUrl = playbook.fileUrl.startsWith('http') 
            ? playbook.fileUrl 
            : `${process.env.VITE_APP_URL || 'https://chatwizs.com'}${playbook.fileUrl}`;

        const mailOptions = {
          from: `"ChatWizs Playbook" <${process.env.SMTP_FROM || 'support@chatwizs.com'}>`,
          to: newLead.email,
          subject: `Your Resource: ${playbook.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eef2f6; border-radius: 20px;">
              <h2>Hi ${newLead.name},</h2>
              <p>Thank you for requesting <strong>${playbook.title}</strong>.</p>
              <p>You can access your resource using the button below:</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${downloadUrl}" style="background-color: #4f46e5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 800;">Access Playbook</a>
              </div>
              <p>Best regards,<br>The ChatWizs Team</p>
            </div>
          `
        };
        // Also notify admin silently
        const adminMailOptions = {
          from: `"System" <${process.env.SMTP_FROM || 'support@chatwizs.com'}>`,
          to: process.env.MASTER_ADMIN_EMAIL || 'support@chatwizs.com',
          subject: `[Playbook] New Lead: ${newLead.name}`,
          text: `A new lead downloaded ${playbook.title}.\nName: ${newLead.name}\nEmail: ${newLead.email}\nPhone: ${newLead.phone}`
        };
        
        await Promise.allSettled([
          transporter.sendMail(mailOptions),
          transporter.sendMail(adminMailOptions)
        ]);
      }
    } catch (err) {
      console.error('Error sending lead email:', err.message);
    }

    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

export default router;
