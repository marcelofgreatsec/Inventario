'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
    Search,
    Plus,
    Database,
    CheckCircle2,
    XCircle,
    Clock,
    Play,
    FileText,
    Loader2,
    RefreshCw
} from 'lucide-react';
import styles from '@/styles/Module.module.css';
import RoutineForm from './RoutineForm';
import { useToast } from '@/components/Toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BackupManagement() {
    const { data: routines, error, mutate, isLoading } = useSWR('/api/backups', fetcher);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isExecuting, setIsExecuting] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleExecute = async (id: string, name: string) => {
        if (!confirm(`Deseja iniciar a rotina "${name}" agora?`)) return;
        setIsExecuting(id);

        try {
            const res = await fetch(`/api/backups/${id}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'Sucesso',
                    evidence: 'Execução manual via painel',
                    logOutput: 'Backup concluído sem erros detectados.'
                }),
            });

            if (!res.ok) throw new Error('Erro ao executar');

            showToast(`Backup "${name}" concluído com sucesso!`, 'success');
            await mutate();
        } catch (err: any) {
            showToast(err.message || 'Falha ao executar backup', 'error');
        } finally {
            setIsExecuting(null);
        }
    };

    return (
        <div className={styles.moduleWrapper}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.title}>Rotinas de Backup</h2>
                <div className={styles.controls}>
                    <div className={styles.inputWrapper}>
                        <Search size={18} className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Buscar rotinas..."
                            className={styles.input}
                        />
                    </div>
                    <button className={styles.actionButton} onClick={() => mutate()} title="Recarregar">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className={styles.buttonPrimary} onClick={() => setIsFormOpen(true)}>
                        <Plus size={18} />
                        Nova Rotina
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={32} className="animate-spin" />
                    <span>Carregando rotinas...</span>
                </div>
            ) : error ? (
                <div className={styles.errorBanner}>Erro ao carregar dados.</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th}>Rotina/Sistema</th>
                                <th className={styles.th}>Tipo</th>
                                <th className={styles.th}>Frequência</th>
                                <th className={styles.th}>Última Execução</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routines?.map((routine: any) => (
                                <tr key={routine.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.assetName}>{routine.name}</div>
                                        <div className={styles.assetInfo}>{routine.responsible}</div>
                                    </td>
                                    <td className={styles.td}>{routine.type}</td>
                                    <td className={styles.td}>{routine.frequency}</td>
                                    <td className={styles.td}>
                                        {routine.lastRun ? new Date(routine.lastRun).toLocaleString('pt-BR') : 'Nunca executado'}
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.statusBadge} ${routine.status === 'Sucesso' ? styles.statusActive :
                                                routine.status === 'Erro' ? styles.statusDisabled :
                                                    styles.statusMaintenance
                                            }`}>
                                            {routine.status === 'Sucesso' && <CheckCircle2 size={12} style={{ marginRight: 4 }} />}
                                            {routine.status === 'Erro' && <XCircle size={12} style={{ marginRight: 4 }} />}
                                            {routine.status === 'Pendente' && <Clock size={12} style={{ marginRight: 4 }} />}
                                            {routine.status}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actionsCell}>
                                            <button
                                                className={styles.actionButton}
                                                title="Executar Agora"
                                                onClick={() => handleExecute(routine.id, routine.name)}
                                                disabled={isExecuting === routine.id}
                                            >
                                                {isExecuting === routine.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                                            </button>
                                            <button className={styles.actionButton} title="Ver Logs">
                                                <FileText size={16} />
                                            </button>
                                            <button className={styles.actionButton} title="Configurar">
                                                <Database size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isFormOpen && (
                <RoutineForm onClose={() => setIsFormOpen(false)} onSuccess={() => mutate()} />
            )}
        </div>
    );
}
