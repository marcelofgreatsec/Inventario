'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import {
    Folder, FolderPlus, Edit2, Trash2, ChevronRight,
    Wifi, Server, Database, Shield, HardDrive, Archive,
    Copy, Eye, EyeOff, Loader2, AlertTriangle, Check,
    Clock, User, Plus, AlignLeft, FileText, Link2, Key, Search, Tag
} from 'lucide-react';
import styles from './Docs.module.css';
import DocForm from './DocForm';
import CategoryForm from './CategoryForm';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORY_ICONS: Record<string, any> = {
    vpn: Wifi, remote: Server, servers: Server, network: Wifi,
    backup: Database, procedures: AlignLeft, others: Folder,
    folder: Folder, shield: Shield, storage: HardDrive, archive: Archive,
};

const TYPE_ICONS: Record<string, any> = {
    Documento: FileText, Link: Link2, Credencial: Key, Procedimento: AlignLeft,
};

const TYPE_COLORS: Record<string, string> = {
    Documento: '#6366f1', Link: '#3b82f6', Credencial: '#f59e0b', Procedimento: '#10b981',
};

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button className={styles.iconBtn} onClick={copy} title="Copiar">
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
        </button>
    );
}

function CredentialBadge({ docId }: { docId: string }) {
    const [revealed, setRevealed] = useState<{ credUser?: string; credPass?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const reveal = async () => {
        if (revealed) { setRevealed(null); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/docs/${docId}/reveal`, { method: 'POST' });
            if (!res.ok) throw new Error('Sem permissão');
            const data = await res.json();
            setRevealed(data);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.credBlock}>
            {revealed ? (
                <>
                    <div className={styles.credRow}>
                        <span className={styles.credLabel}>Usuário:</span>
                        <code className={styles.credVal}>{revealed.credUser}</code>
                        <CopyButton text={revealed.credUser ?? ''} />
                    </div>
                    <div className={styles.credRow}>
                        <span className={styles.credLabel}>Senha:</span>
                        <code className={styles.credVal}>{revealed.credPass}</code>
                        <CopyButton text={revealed.credPass ?? ''} />
                    </div>
                </>
            ) : (
                <span className={styles.credHidden}>●●●●●●●● (oculto)</span>
            )}
            <button className={styles.revealBtn} onClick={reveal} disabled={loading}>
                {loading ? <Loader2 size={13} className={styles.spin} /> : revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                {revealed ? 'Ocultar' : 'Revelar credencial'}
            </button>
        </div>
    );
}

export default function DocumentList() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role;

    const { data: categories, mutate: mutCats } = useSWR('/api/docs/categories', fetcher);
    const safeCategories = Array.isArray(categories) ? categories : [];
    const [selectedCat, setSelectedCat] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [search, setSearch] = useState('');

    const params = new URLSearchParams();
    if (selectedCat !== 'all') params.set('category', selectedCat);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (search) params.set('search', search);
    const { data: docs, mutate: mutDocs, isLoading } = useSWR(`/api/docs?${params}`, fetcher, { refreshInterval: 0 });
    const safeDocs = Array.isArray(docs) ? docs : [];

    const [formOpen, setFormOpen] = useState(false);
    const [editDoc, setEditDoc] = useState<any>(null);
    const [catFormOpen, setCatFormOpen] = useState(false);
    const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

    const catCount = useMemo(() => {
        const map: Record<string, number> = {};
        safeDocs?.forEach((d: any) => { map[d.categoryId] = (map[d.categoryId] ?? 0) + 1; });
        return map;
    }, [safeDocs]);

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir documento permanentemente?')) return;
        await fetch(`/api/docs/${id}`, { method: 'DELETE' });
        mutDocs();
    };

    const handleDeleteCat = async (id: string) => {
        if (!confirm('Excluir categoria e todos os documentos dela?')) return;
        await fetch(`/api/docs/categories/${id}`, { method: 'DELETE' });
        mutCats();
        mutDocs();
    };

    return (
        <div className={styles.wrapper}>
            {/* ── Sidebar ── */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3 className={styles.sidebarTitle}>Categorias</h3>
                    {['ADMIN', 'TI'].includes(role) && (
                        <button className={styles.iconBtn} onClick={() => setCatFormOpen(true)} title="Nova categoria">
                            <Plus size={18} />
                        </button>
                    )}
                </div>

                <div className={styles.catList}>
                    <button
                        className={`${styles.catRow} ${selectedCat === 'all' ? styles.catRowActive : ''}`}
                        onClick={() => setSelectedCat('all')}
                    >
                        <div className={styles.catMain}>
                            <Folder size={18} />
                            <span className={styles.catLabel}>Todos os Documentos</span>
                        </div>
                        <span className={styles.catBadge}>{safeDocs?.length ?? 0}</span>
                    </button>

                    {safeCategories?.map((cat: any) => {
                        const Icon = CATEGORY_ICONS[cat.icon] ?? Folder;
                        return (
                            <div key={cat.id} className={`${styles.catRow} ${selectedCat === cat.id ? styles.catRowActive : ''}`}>
                                <div className={styles.catMain} onClick={() => setSelectedCat(cat.id)}>
                                    <Icon size={18} />
                                    <span className={styles.catLabel}>{cat.name}</span>
                                </div>
                                <span className={styles.catBadge}>{cat._count?.docs ?? catCount[cat.id] ?? 0}</span>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* ── Main Area ── */}
            <main className={styles.main}>
                <div className={styles.toolbar}>
                    <div className={styles.searchWrap}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Buscar guias, procedimentos ou credenciais..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className={styles.filterSel} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                        <option value="all">Tipos</option>
                        {['Documento', 'Link', 'Credencial', 'Procedimento'].map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                    {['ADMIN', 'TI'].includes(role) && (
                        <button className={styles.btnPrimary} onClick={() => { setEditDoc(null); setFormOpen(true); }}>
                            <Plus size={18} /> Novo Passo-a-Passo
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className={styles.state}>
                        <Loader2 size={32} className={styles.spin} />
                        <span>Sincronizando documentos...</span>
                    </div>
                ) : safeDocs?.length === 0 ? (
                    <div className={styles.state}>
                        <AlignLeft size={48} />
                        <span>Sua base de conhecimento está pronta.</span>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Adicione guias internos e manuais de operação aqui.</p>
                        {['ADMIN', 'TI'].includes(role) && (
                            <button className={styles.btnPrimary} onClick={() => { setEditDoc(null); setFormOpen(true); }}>
                                <Plus size={18} /> Criar Primeiro Guia
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {safeDocs.map((doc: any) => {
                            const TypeIcon = TYPE_ICONS[doc.type] ?? FileText;
                            const color = TYPE_COLORS[doc.type] ?? '#6366f1';
                            const isOpen = expandedDoc === doc.id;

                            return (
                                <div key={doc.id} className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`} onClick={() => setExpandedDoc(isOpen ? null : doc.id)}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIconWrap} style={{ background: `${color}15`, color }}>
                                            <TypeIcon size={24} />
                                        </div>
                                        <div className={styles.cardMeta}>
                                            <span className={styles.cardTitle}>{doc.title}</span>
                                            <span className={styles.cardCat}>{doc.category?.name}</span>
                                        </div>
                                        <div className={styles.badge} style={{ background: `${color}15`, color }}>
                                            {doc.type}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className={styles.cardBody} onClick={(e) => e.stopPropagation()}>
                                            {doc.description && <p className={styles.cardDesc}>{doc.description}</p>}

                                            {doc.type === 'Link' && doc.content && (
                                                <a href={doc.content} target="_blank" rel="noreferrer" className={styles.procedureBlock} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                                                    <Link2 size={16} /> {doc.content}
                                                </a>
                                            )}

                                            {doc.type === 'Credencial' && <CredentialBadge docId={doc.id} />}

                                            {doc.type === 'Procedimento' && doc.content && (
                                                <div className={styles.procedureBlock}>
                                                    {doc.content}
                                                </div>
                                            )}

                                            <div className={styles.cardFooter}>
                                                <div className={styles.footerInfo}>
                                                    {doc.responsible && (
                                                        <span><User size={14} /> {doc.responsible}</span>
                                                    )}
                                                    <span><Clock size={14} /> {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <div className={styles.footerActions}>
                                                    {['ADMIN', 'TI'].includes(role) && (
                                                        <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); setEditDoc(doc); setFormOpen(true); }}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    {role === 'ADMIN' && (
                                                        <button className={`${styles.iconBtn} ${styles.danger}`} onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {formOpen && (
                <DocForm
                    categories={safeCategories}
                    initialData={editDoc}
                    onClose={() => setFormOpen(false)}
                    onSuccess={() => { mutDocs(); setFormOpen(false); }}
                />
            )}
            {catFormOpen && (
                <CategoryForm
                    onClose={() => setCatFormOpen(false)}
                    onSuccess={() => { mutCats(); setCatFormOpen(false); }}
                />
            )}
        </div>
    );
}
