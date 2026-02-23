'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    FileText,
    Filter,
    Download,
    Loader2,
    RefreshCw
} from 'lucide-react';
import styles from '@/styles/Module.module.css';
import AssetForm from './AssetForm';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AssetInventory() {
    const { data: assets, error, mutate, isLoading } = useSWR('/api/assets', fetcher);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este ativo?')) return;

        try {
            const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erro ao excluir');
            mutate();
        } catch (err) {
            alert('Falha ao excluir o ativo.');
        }
    };

    const filteredAssets = assets?.filter((asset: any) =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ip?.includes(searchTerm)
    );

    return (
        <div className={styles.moduleWrapper}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.title}>Lista de Ativos</h2>
                <div className={styles.controls}>
                    <div className={styles.inputWrapper}>
                        <Search size={18} className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Buscar ativos (nome, IP, ID...)"
                            className={styles.input}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className={styles.actionButton} onClick={() => mutate()} title="Recarregar">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button className={styles.buttonPrimary} onClick={() => { setEditingAsset(null); setIsFormOpen(true); }}>
                        <Plus size={18} />
                        Novo Ativo
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={32} className="animate-spin" />
                    <span>Carregando ativos...</span>
                </div>
            ) : error ? (
                <div className={styles.errorBanner}>Erro ao carregar dados.</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead className={styles.thead}>
                            <tr>
                                <th className={styles.th}>Ativo</th>
                                <th className={styles.th}>Tipo</th>
                                <th className={styles.th}>Localização</th>
                                <th className={styles.th}>Endereço IP</th>
                                <th className={styles.th}>Status</th>
                                <th className={styles.th}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets?.map((asset: any) => (
                                <tr key={asset.id} className={styles.tr}>
                                    <td className={styles.td}>
                                        <div className={styles.assetName}>{asset.name}</div>
                                        <div className={styles.assetInfo}>{asset.id}</div>
                                    </td>
                                    <td className={styles.td}>{asset.type}</td>
                                    <td className={styles.td}>{asset.location}</td>
                                    <td className={styles.td}>{asset.ip || '-'}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.statusBadge} ${asset.status === 'Ativo' ? styles.statusActive :
                                                asset.status === 'Manutenção' ? styles.statusMaintenance :
                                                    styles.statusDisabled
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <div className={styles.actionsCell}>
                                            <button
                                                className={styles.actionButton}
                                                title="Editar"
                                                onClick={() => { setEditingAsset(asset); setIsFormOpen(true); }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={styles.actionButton} title="Anexos">
                                                <FileText size={16} />
                                            </button>
                                            <button
                                                className={styles.actionButton}
                                                style={{ color: 'var(--accent-danger)' }}
                                                onClick={() => handleDelete(asset.id)}
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAssets?.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        Nenhum ativo encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isFormOpen && (
                <AssetForm
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => mutate()}
                    initialData={editingAsset}
                />
            )}
        </div>
    );
}
