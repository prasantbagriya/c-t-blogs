export const API_URL = '/api';

export function getFileUrl(path: string) {
 if (!path) return '';
 if (path.startsWith('http') || path.startsWith('data:')) return path;
 const base = API_URL.replace(/\/api$/, '');
 return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function safeJson(res: Response) {
 try {
 // H-2 FIX: Read as text first to avoid body stream double-consumption
 const text = await res.text();
 try {
 return JSON.parse(text);
 } catch {
 return { error: `HTTP ${res.status}: ${text.substring(0, 200)}` };
 }
 } catch (err) {
 return { error: `HTTP ${res.status}: No response body` };
 }
}

export function getHeaders() {
 const token = localStorage.getItem('chatwiz_token');
 const isValidToken = token && token !== 'null' && token !== 'undefined';
 
 return {
 'Content-Type': 'application/json',
 'Accept': 'application/json',
 ...(isValidToken ? { 
 'Authorization': `Bearer ${token}`,
 'X-Authorization': `Bearer ${token}`,
 'X-Requested-With': 'XMLHttpRequest'
 } : {})
 };
}

export async function encodedPost(url: string, body: any, headers: any = {}) {
 const payload = JSON.stringify(body);
 const encodedPayload = typeof window !== 'undefined' ? window.btoa(payload) : Buffer.from(payload).toString('base64');
 
 return fetch(url, {
 method: 'POST',
 headers: {
 ...headers,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ payload: encodedPayload, isEncoded: true })
 });
}

export async function uploadFile(file: File) {
 const formData = new FormData();
 formData.append('file', file);

 const res = await fetch(`${API_URL}/upload`, {
 method: 'POST',
 headers: {
 'Authorization': getHeaders()['Authorization'] || '',
 'X-Authorization': getHeaders()['X-Authorization'] || ''
 },
 body: formData
 });
 
 const result = await safeJson(res);
 if (!res.ok) throw new Error(result.error || 'Upload failed');
 return result;
}

export async function compressImage(file: File): Promise<File> {
 return new Promise((resolve, reject) => {
 const reader = new FileReader();
 reader.readAsDataURL(file);
 reader.onload = (event) => {
 const img = new Image();
 img.src = event.target?.result as string;
 img.onload = async () => {
 const canvas = document.createElement('canvas');
 const MAX_WIDTH = 600; // Reduced for smaller size
 const MAX_HEIGHT = 600;
 let width = img.width;
 let height = img.height;

 if (width > height) {
 if (width > MAX_WIDTH) {
 height *= MAX_WIDTH / width;
 width = MAX_WIDTH;
 }
 } else {
 if (height > MAX_HEIGHT) {
 width *= MAX_HEIGHT / height;
 height = MAX_HEIGHT;
 }
 }

 canvas.width = width;
 canvas.height = height;
 const ctx = canvas.getContext('2d');
 ctx?.drawImage(img, 0, 0, width, height);
 
 let quality = 0.8;
 let compressedBlob: Blob | null = null;
 
 // M-2 FIX: Loop to reduce quality with null guard
 while (quality > 0.1) {
 const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
 if (!blob) break; // toBlob returned null (browser issue) — stop trying
 compressedBlob = blob; // Always keep last successful blob
 if (blob.size < 102400) break; // 100KB target met
 quality -= 0.1;
 }

 if (compressedBlob) {
 resolve(new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg', lastModified: Date.now() }));
 } else {
 reject(new Error('Compression failed'));
 }
 };
 img.onerror = () => reject(new Error('Image load failed'));
 };
 reader.onerror = () => reject(new Error('File read failed'));
 });
}
