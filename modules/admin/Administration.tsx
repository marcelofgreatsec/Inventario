'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
    Users,
    Shield,
    History,
    Plus,
    Search,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Loader2,
    Lock
} from 'lucide-react';
import styles from '@/styles/Module.module.css';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Administration() {
    const { data: auditLogs, isLoading: loadingLogs } = useSWR('/api/admin/logs', fetcher);
    // Mocking users for now as we don't have a full User CRUD yet, but showing real roles
    const users = [
        { id: 1, name: 'Admin TI', email: 'admin@fgreat.com', role: 'ADMIN', lastLogin: 'Hoje, 09:30' },
        { id: 2, name: 'João Silva', email: 'joao@fgreat.com', role: 'TI', lastLogin: 'Ontem, 16:45' },
    ];

    return (
        <div className={styles.moduleWrapper}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.title}>Painel de Administração</h2>
            </div>

            <div className={styles.formGrid}>
                {/* User Management */}
                <div style={{ gridColumn: 'span 2' }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.subtitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> Usuários do Sistema
                        </h3>
                        <div className={styles.controls}>
                            <button className={styles.buttonPrimary}>
                                <Plus size={18} /> Convidar Usuário
                            </button>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr>
                                    <th className={styles.th}>Nome / Email</th>
                                    <th className={styles.th}>Função</th>
                                    <th className={styles.th}>Último Acesso</th>
                                    <th className={styles.th}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <div className={styles.assetName}>{user.name}</div>
                                            <div className={styles.assetInfo}>{user.email}</div>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.statusBadge} ${user.role === 'ADMIN' ? styles.statusActive : styles.statusMaintenance}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className={styles.td}>{user.lastLogin}</td>
                                        <td className={styles.td}>
                                            <button className={styles.actionButton}><Lock size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit Logs */}
                <div style={{ gridColumn: 'span 2', marginTop: '2rem' }}>
                    <h3 className={styles.subtitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <History size={20} /> Logs de Auditoria
                    </h3>

                    {loadingLogs ? (
                        <div className={styles.loadingState}>
                            <Loader2 size={32} className="animate-spin" />
                            <span>Carregando auditoria...</span>
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead className={styles.thead}>
                                    <tr>
                                        <th className={styles.th}>Data/Hora</th>
                                        <th className={styles.th}>Usuário</th>
                                        <th className={styles.th}>Ação</th>
                                        <th className={styles.th}>Recurso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs?.map((log: any) => (
                                        <tr key={log.id} className={styles.tr}>
                                            <td className={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className={styles.td}>{log.user?.name || 'Sistema'}</td>
                                            <td className={styles.td}>
                                                <code style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>
                                                    {log.action}
                                                </code>
                                            </td>
                                            <td className={styles.td}>{log.resource}</td>
                                        </tr>
                                    ))}
                                    {(!auditLogs || auditLogs.length === 0) && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Nenhum log encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
