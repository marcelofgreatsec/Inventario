'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '12px',
                                padding: '1rem 1.25rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                minWidth: '300px',
                                maxWidth: '450px'
                            }}
                        >
                            <div style={{
                                color:
                                    toast.type === 'success' ? '#10b981' :
                                        toast.type === 'error' ? '#ef4444' :
                                            toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
                            }}>
                                {toast.type === 'success' && <CheckCircle size={20} />}
                                {toast.type === 'error' && <XCircle size={20} />}
                                {toast.type === 'warning' && <AlertCircle size={20} />}
                                {toast.type === 'info' && <Info size={20} />}
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{ color: 'var(--text-tertiary)', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}
