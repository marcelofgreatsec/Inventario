'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import styles from '@/styles/Module.module.css';

const TYPES = ['Documento', 'Link', 'Credencial', 'Procedimento'];

interface DocFormProps {
    categories: any[];
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DocForm({ categories, initialData, onClose, onSuccess }: DocFormProps) {
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: initialData ?? { type: 'Documento' },
    });
    const type = watch('type');

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const url = initialData ? `/api/docs/${initialData.id}` : '/api/docs';
            const method = initialData ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error((await res.json()).error ?? 'Erro');
            onSuccess();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: 620 }}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>{initialData ? 'Editar Documento' : 'Novo Documento'}</h3>
                    <button className={styles.closeButton} onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label className={styles.label}>Título *</label>
                            <input {...register('title', { required: true })} className={styles.input} placeholder="Nome do documento" />
                            {errors.title && <span className={styles.fieldError}>Obrigatório</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Categoria *</label>
                            <select {...register('categoryId', { required: true })} className={styles.input}>
                                <option value="">Selecione...</option>
                                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.categoryId && <span className={styles.fieldError}>Obrigatório</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tipo *</label>
                            <select {...register('type', { required: true })} className={styles.input}>
                                {TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label className={styles.label}>Descrição</label>
                            <textarea {...register('description')} className={styles.input} rows={2} placeholder="Descreva brevemente este documento..." style={{ resize: 'vertical' }} />
                        </div>

                        {type === 'Link' && (
                            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                <label className={styles.label}>URL</label>
                                <input {...register('content')} className={styles.input} placeholder="https://..." type="url" />
                            </div>
                        )}

                        {type === 'Credencial' && (
                            <>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Usuário</label>
                                    <input {...register('credUser')} className={styles.input} placeholder="usuário@dominio" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Senha</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            {...register('credPass')}
                                            className={styles.input}
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Senha (será criptografada)"
                                            style={{ paddingRight: '2.5rem' }}
                                        />
                                        <button type="button" onClick={() => setShowPass(s => !s)}
                                            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <span className={styles.fieldError} style={{ color: 'var(--text-tertiary)' }}>
                                        🔐 Armazenada com criptografia
                                    </span>
                                </div>
                            </>
                        )}

                        {type === 'Procedimento' && (
                            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                <label className={styles.label}>Procedimento (passo a passo)</label>
                                <textarea {...register('content')} className={styles.input} rows={6} placeholder="1. Passo um&#10;2. Passo dois..." style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Responsável</label>
                            <input {...register('responsible')} className={styles.input} placeholder="Ex: João Silva" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tags (separadas por vírgula)</label>
                            <input {...register('tags')} className={styles.input} placeholder="vpn, acesso, prod" />
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.buttonSecondary} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.buttonPrimary} disabled={loading}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
