'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import styles from '@/styles/Module.module.css';

const ICON_OPTIONS = [
    { value: 'folder', label: '📁 Pasta' },
    { value: 'vpn', label: '🌐 VPN' },
    { value: 'remote', label: '🖥️ Acesso Remoto' },
    { value: 'servers', label: '🗄️ Servidores' },
    { value: 'network', label: '📡 Rede' },
    { value: 'backup', label: '💾 Backup' },
    { value: 'procedures', label: '📋 Procedimentos' },
    { value: 'shield', label: '🛡️ Segurança' },
    { value: 'storage', label: '💿 Storage' },
    { value: 'archive', label: '🗃️ Arquivo' },
    { value: 'others', label: '📦 Outros' },
];

export default function CategoryForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('folder');
    const [loading, setLoading] = useState(false);

    const save = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('/api/docs/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, icon }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            onSuccess();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: 400 }}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Nova Categoria</h3>
                    <button className={styles.closeButton} onClick={onClose}><X size={20} /></button>
                </div>
                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome da Categoria *</label>
                        <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: VPN Corporativa" />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ícone</label>
                        <select className={styles.input} value={icon} onChange={(e) => setIcon(e.target.value)}>
                            {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className={styles.modalFooter}>
                        <button className={styles.buttonSecondary} onClick={onClose}>Cancelar</button>
                        <button className={styles.buttonPrimary} onClick={save} disabled={loading || !name.trim()}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Criar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
