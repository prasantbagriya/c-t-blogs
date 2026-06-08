/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlaybookItem {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'ppt' | 'docx' | 'other';
  fileUrl: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  version: string;
  createdAt: number;
  updatedAt: number;
  authorId: string;
  authorName?: string;
  isActive: boolean;
  isFeatured: boolean;
  priceType: 'free' | 'paid';
  price?: number;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  estimatedMinutes?: number;
  fileSize?: number; // In bytes
  downloadCount: number;
}

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  playbookId: string;
  playbookTitle: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}
