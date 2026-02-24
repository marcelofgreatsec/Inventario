'use client';

import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import styles from '@/styles/Module.module.css';
import { useToast } from '@/components/Toast';

interface LicenseFormProps {
    license?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LicenseForm({ license, onClose, onSuccess }: LicenseFormProps) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({
        defaultValues: license || {
            name: '',
            provider: '',
            key: '',
            totalSeats: 1,
            usedSeats: 0,
            monthlyCost: 0,
            status: 'Ativo',
            responsible: '',
            notes: ''
        }
    });

    const { showToast } = useToast();

    const onSubmit = async (data: any) => {
        try {
            const url = license ? `/api/licenses/${license.id}` : '/api/licenses';
            const method = license ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Falha ao salvar licença');

            showToast(`Licença "${data.name}" ${license ? 'atualizada' : 'registrada'} com sucesso!`, 'success');
            onSuccess();
            onClose();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.title}>{license ? 'Editar Licença' : 'Nova Licença'}</h3>
                    <button className={styles.actionButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome da Software/Serviço</label>
                        <input {...register('name', { required: true })} className={styles.input} placeholder="Ex: Adobe Creative Cloud" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Provedor/Vendedor</label>
                        <input {...register('provider', { required: true })} className={styles.input} placeholder="Ex: Adobe Inc." />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Total de Assentos</label>
                            <input type="number" {...register('totalSeats')} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Assentos em Uso</label>
                            <input type="number" {...register('usedSeats')} className={styles.input} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Custo Mensal (R$)</label>
                            <input type="number" step="0.01" {...register('monthlyCost')} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Status</label>
                            <select {...register('status')} className={styles.input}>
                                <option value="Ativo">Ativo</option>
                                <option value="Expirado">Expirado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Chave de Ativação (Opcional)</label>
                        <input {...register('key')} className={styles.input} placeholder="ID ou Serial" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Responsável</label>
                        <input {...register('responsible')} className={styles.input} placeholder="Nome do gestor" />
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.buttonSecondary} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.buttonPrimary} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Salvar Licença'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
