'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import styles from '@/styles/Module.module.css';

const routineSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório'),
    type: z.string().min(1, 'Tipo é obrigatório'),
    frequency: z.string().min(1, 'Frequência é obrigatória'),
    responsible: z.string().min(1, 'Responsável é obrigatório'),
});

type RoutineFormValues = z.infer<typeof routineSchema>;

interface RoutineFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function RoutineForm({ onClose, onSuccess }: RoutineFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<RoutineFormValues>({
        resolver: zodResolver(routineSchema)
    });

    const onSubmit = async (data: RoutineFormValues) => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/backups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Falha ao salvar rotina');

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
                    <h3 className={styles.modalTitle}>Cadastrar Nova Rotina de Backup</h3>
                    <button className={styles.closeButton} onClick={onClose}><X size={20} /></button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    {error && <div className={styles.errorBanner}>{error}</div>}

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome da Rotina/Sistema</label>
                            <input {...register('name')} className={styles.input} placeholder="Ex: Backup Diário - SQL Prod" />
                            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tipo de Backup</label>
                            <select {...register('type')} className={styles.input}>
                                <option value="">Selecione...</option>
                                <option value="Nuvem">Nuvem</option>
                                <option value="Local">Local</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                            {errors.type && <span className={styles.fieldError}>{errors.type.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Frequência</label>
                            <input {...register('frequency')} className={styles.input} placeholder="Ex: Diário (02:00)" />
                            {errors.frequency && <span className={styles.fieldError}>{errors.frequency.message}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Responsável</label>
                            <input {...register('responsible')} className={styles.input} placeholder="Ex: João Silva" />
                            {errors.responsible && <span className={styles.fieldError}>{errors.responsible.message}</span>}
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.buttonSecondary} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.buttonPrimary} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar Rotina
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
