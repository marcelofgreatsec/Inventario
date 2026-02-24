'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
    Search,
    Plus,
    Key,
    DollarSign,
    Users,
    AlertCircle,
    Loader2,
    RefreshCw,
    Edit3,
    Trash2,
    Filter
} from 'lucide-react';
import styles from '@/styles/Module.module.css';
import LicenseForm from './LicenseForm';
import { useToast } from '@/components/Toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function LicenseManagement() {
    const { data: licenses, error, mutate, isLoading } = useSWR('/api/licenses', fetcher);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<any>(null);
    const { showToast } = useToast();

    // Aggregates for quick audit
    const stats = useMemo(() => {
        if (!licenses || !Array.isArray(licenses)) return { total: 0, cost: 0, usage: 0 };
        return {
            total: licenses.length,
            cost: licenses.reduce((acc: number, l: any) => acc + (l.monthlyCost || 0), 0),
            usage: licenses.reduce((acc: number, l: any) => acc + (l.usedSeats || 0), 0)
        };
    }, [licenses]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir a licença "${name}"? Esta ação é irreversível.`)) return;

        try {
            const res = await fetch(`/api/licenses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Falha ao excluir licença');
            showToast(`Licença "${name}" removida com sucesso.`, 'success');
            mutate();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleEdit = (license: any) => {
        setSelectedLicense(license);
        setIsFormOpen(true);
    };

    return (
        <div className={styles.moduleWrapper}>
            <header className={styles.sectionHeader}>
                <h2 className={styles.title}>Gestão de Licenças e Assinaturas</h2>
                <div className={styles.controls}>
                    <div className={styles.inputWrapper}>
                        <Search size={18} className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Buscar softwares ou provedores..."
                            className={styles.input}
                        />
                    </div>
                    <button className={styles.actionButton} onClick={() => mutate()} title="Sincronizar">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className={styles.buttonPrimary} onClick={() => { setSelectedLicense(null); setIsFormOpen(true); }}>
                        <Plus size={18} />
                        Nova Licença
                    </button>
                </div>
            </header>

            {/* License Stats Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className={styles.tableContainer} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--accent-light)', padding: '0.75rem', borderRadius: '12px' }}>
                        <Key color="var(--accent-primary)" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total de Licenças</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
                    </div>
                </div>
                <div className={styles.tableContainer} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                        <DollarSign color="#10b981" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Custo Mensal Estimado</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.cost)}
                        </div>
                    </div>
                </div>
                <div className={styles.tableContainer} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                        <Users color="#f59e0b" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Assentos em Uso</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.usage}</div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
                    <span>Carregando base de licenças...</span>
                </div>
            ) : error ? (
                <div className={styles.errorBanner}>Erro ao carregar licenças do servidor.</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th}>Software/Provedor</th>
                                <th className={styles.th}>Uso/Assentos</th>
                                <th className={styles.th}>Custo Mensal</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Responsável</th>
                                <th className={styles.th}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {licenses?.map((license: any) => (
                                <tr key={license.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.assetName}>{license.name}</div>
                                        <div className={styles.assetInfo}>{license.provider}</div>
                                    </td>
                                    <td className={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '60px', height: '6px', background: 'var(--surface-2)', borderRadius: '3px' }}>
                                                <div style={{
                                                    width: `${Math.min((license.usedSeats / license.totalSeats) * 100, 100)}%`,
                                                    height: '100%',
                                                    background: 'var(--accent-primary)',
                                                    borderRadius: '3px'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.8rem' }}>{license.usedSeats}/{license.totalSeats}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(license.monthlyCost)}
                                    </td>
                                    <td className={styles.td}>
                                        <span className={`${styles.statusBadge} ${license.status === 'Ativo' ? styles.statusActive : styles.statusDisabled
                                            }`}>
                                            {license.status}
                                        </span>
                                    </td>
                                    <td className={styles.td}>{license.responsible || 'N/A'}</td>
                                    <td className={styles.td}>
                                        <div className={styles.actionsCell}>
                                            <button className={styles.actionButton} onClick={() => handleEdit(license)} title="Editar">
                                                <Edit3 size={16} />
                                            </button>
                                            <button className={styles.actionButton} onClick={() => handleDelete(license.id, license.name)} title="Excluir" style={{ color: '#ef4444' }}>
                                                <Trash2 size={16} />
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
                <LicenseForm
                    license={selectedLicense}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => mutate()}
                />
            )}
        </div>
    );
}
