import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { MessageSquare, Globe, User, ShoppingCart, FileText, Layout } from 'lucide-react';
import { Instagram } from '../common/BrandIcons';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    data: { label: 'When Message Received' },
    position: { x: 250, y: 50 },
  },
];

export const initialEdges: Edge[] = [];

// --- Flow Types Configuration ---
export const FLOW_TYPES = [
  {
    id: 'whatsapp_dedicated',
    label: 'WhatsApp Dedicated Flow',
    desc: 'Sirf WhatsApp support (Buttons, Lists, Media).',
    icon: <MessageSquare />,
    color: '#10b981'
  },
  {
    id: 'website_leadgen',
    label: 'Website Lead Gen',
    desc: 'Focus on floating widgets, forms, aur data capture.',
    icon: <Globe />,
    color: '#3b82f6'
  },
  {
    id: 'website_livechat',
    label: 'Website Live Chat',
    desc: 'Focused on FAQ automation aur Human Agent handoff.',
    icon: <User />,
    color: '#6366f1'
  },
  {
    id: 'ecommerce_engine',
    label: 'E-commerce Engine',
    desc: 'Product catalogs, cart management, aur payments.',
    icon: <ShoppingCart />,
    color: '#f97316'
  },
  {
    id: 'google_sheet_automation',
    label: 'Google Sheet Automation',
    desc: 'Trigger flows when a new row is added to your sheet.',
    icon: <FileText />,
    color: '#0F9D58'
  },
  {
    id: 'instagram_automation',
    label: 'Instagram DM Automation',
    desc: 'Manage DMs and Story replies with AI and structured flows.',
    icon: <Instagram />,
    color: '#d62976'
  },
  {
    id: 'custom_blank',
    label: 'Custom (Blank Canvas)',
    desc: 'Full freedom with all nodes and MCP connectivity.',
    icon: <Layout />,
    color: '#64748b'
  },
];
