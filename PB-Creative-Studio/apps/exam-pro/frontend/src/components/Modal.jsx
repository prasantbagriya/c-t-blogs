import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, subtitle, size = '', children }) {
  if (!open) return null;
  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

