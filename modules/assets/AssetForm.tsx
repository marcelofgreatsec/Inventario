'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import styles from '@/styles/Module.module.css';
import { useToast } from '@/components/Toast';

const assetSchema = z.object({
    id: z.string().min(3, 'ID deve ter no mínimo 3 caracteres'),
    name: z.string().min(2, 'Nome é obrigatório'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    location: z.string().min(1, 'Localização é obrigatória'),
    status: z.string(),
    ip: z.string().optional().or(z.literal('')),
});

type AssetFormValues = {
    id: string;
    name: string;
    type: string;
    location: string;
    status: string;
    ip?: string;
};

interface AssetFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function AssetForm({ onClose, onSuccess, initialData }: AssetFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<AssetFormValues>({
        resolver: zodResolver(assetSchema),
        defaultValues: initialData || {
            status: 'Ativo',
        }
    });

    const onSubmit = async (data: AssetFormValues) => {
        setIsLoading(true);
        setError('');

        try {
            const url = initialData ? `/api/assets/${initialData.id}` : '/api/assets';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Falha ao salvar ativo');

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao salvar');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        {initialData ? 'Editar Ativo' : 'Cadastrar Novo Ativo'}
                    </h3>
                    <button className={styles.closeButton} onClick={onClose}><X size={20} /></button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    {error && <div className={styles.errorBanner}>{error}</div>}

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>ID do Ativo (ex: AST-001)</label>
                            <input
                                {...register('id')}
                                className={styles.input}
                                disabled={!!initialData}
                                placeholder="AST-XXX"
                            />
                            {errors.id && <span className={styles.fieldError}>{errors.id.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome do Ativo</label>
                            <input {...register('name')} className={styles.input} placeholder="Ex: SRV-PROD-01" />
                            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tipo</label>
                            <select {...register('type')} className={styles.input}>
                                <option value="">Selecione...</option>
                                <option value="Servidor">Servidor</option>
                                <option value="Rede">Rede</option>
                                <option value="Notebook">Notebook</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Storage">Storage</option>
                            </select>
                            {errors.type && <span className={styles.fieldError}>{errors.type.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Localização</label>
                            <input {...register('location')} className={styles.input} placeholder="Ex: Datacentre A" />
                            {errors.location && <span className={styles.fieldError}>{errors.location.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Endereço IP</label>
                            <input {...register('ip')} className={styles.input} placeholder="Ex: 192.168.1.10" />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Status</label>
                            <select {...register('status')} className={styles.input}>
                                <option value="Ativo">Ativo</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Desativado">Desativado</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.buttonSecondary} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.buttonPrimary} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar Ativo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
