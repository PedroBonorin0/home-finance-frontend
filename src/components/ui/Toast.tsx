import React, { createContext, useCallback, useContext, useState } from 'react';

interface Toast { id: number; message: string; type: 'success' | 'error'; }

interface ToastCtx { show: (msg: string, type?: 'success' | 'error') => void; }

const Ctx = createContext<ToastCtx>({ show: () => {} });

export const useToast = () => useContext(Ctx);

let _id = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++_id;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
};
