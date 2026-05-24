import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

let addToastFn = null;

export function useToast() {
  return useCallback((message, type = 'success') => {
    if (addToastFn) addToastFn(message, type);
  }, []);
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  addToastFn = (message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };

  return createPortal(
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`toast ${t.type}`}>
            <Icon />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ opacity: 0.6, display: 'flex', alignItems: 'center' }}><X size={16} /></button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}

