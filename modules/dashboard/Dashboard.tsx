'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import useSWR from 'swr';
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Activity,
    Shield,
    Filter,
    RefreshCw,
    ArrowUpRight,
    Zap,
    Box,
    Cpu,
    Wifi,
    Server,
    HardDrive,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

import { fetcher, generateHistory, generateHeatmap } from './utils/dashboardUtils';
import styles from './Dashboard.module.css';

// Constants
const PERIOD_OPTIONS = ['7 dias', '30 dias', '90 dias'];
const HEATMAP_COLORS = [
    'var(--surface-2)',
    'var(--accent-light)',
    'RGBA(0, 112, 209, 0.3)',
    'RGBA(0, 112, 209, 0.5)',
    'RGBA(0, 112, 209, 0.7)',
    'var(--accent-primary)'
];
const STATUS_COLORS = {
    Ativo: '#10b981',
    Manutenção: '#f59e0b',
    Desativado: '#ef4444',
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, change, icon: Icon, color, subtitle }: any) => {
    const isPositive = change?.startsWith('+') ?? true;

    return (
        <div className={styles.kpiCard} style={{ '--accent': color } as any}>
            <div className={styles.kpiTop}>
                <div className={styles.kpiIconWrap} style={{ background: `${color}18` }}>
                    <Icon size={22} color={color} />
                </div>
                {change && (
                    <span className={`${styles.kpiBadge} ${isPositive ? styles.badgeGreen : styles.badgeRed}`}>
                        {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {change}
                    </span>
                )}
            </div>
            <div className={styles.kpiValue}>{value}</div>
            <div className={styles.kpiLabel}>{label}</div>
            {subtitle && <div className={styles.kpiSub}>{subtitle}</div>}
            <div className={styles.kpiBar} style={{ background: `${color}22` }}>
                <div className={styles.kpiBarFill} style={{ background: color, width: '70%', transition: 'width 1s ease-out' }} />
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipLabel}>{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color, margin: '2px 0', fontSize: '0.8rem' }}>
                    {p.name}: <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
    const supabase = createClient();
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || null);
            }
        });
    }, []);

    const { data: assets, isLoading: loadingAssets } = useSWR('/api/assets', fetcher);
    const { data: routines, isLoading: loadingRoutines, mutate } = useSWR('/api/backups', fetcher);
    const { data: licenses, isLoading: loadingLicenses } = useSWR('/api/licenses', fetcher);

    const [period, setPeriod] = useState('30 dias');
    const isLoading = loadingAssets || loadingRoutines || loadingLicenses;

    // Memoized Data Processing
    const days = period === '7 dias' ? 7 : period === '30 dias' ? 30 : 90;
    const history = useMemo(() => generateHistory(days), [days]);
    const heatmap = useMemo(() => generateHeatmap(), []);

    const stats = useMemo(() => {
        const total = assets?.length ?? 0;
        const critical = assets?.filter((a: any) => a.status === 'Desativado').length ?? 0;
        const ok = routines?.filter((r: any) => r.status === 'Sucesso').length ?? 0;
        const totalR = routines?.length ?? 0;
        const compliance = totalR > 0 ? Math.round((ok / totalR) * 100) : 0;

        const licenseCost = licenses?.reduce((acc: number, l: any) => acc + (l.monthlyCost || 0), 0) || 0;

        return { total, critical, ok, compliance, licenseCost };
    }, [assets, routines, licenses]);

    const pieData = useMemo(() => {
        const counts: Record<string, number> = { Ativo: 0, Manutenção: 0, Desativado: 0 };
        assets?.forEach((a: any) => { if (counts[a.status] !== undefined) counts[a.status]++; });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [assets]);

    const alerts = useMemo(() => {
        const list: any[] = [];
        routines?.filter((r: any) => r.status === 'Erro').forEach((r: any) =>
            list.push({ icon: XCircle, text: `Falha crítica: ${r.name}`, severity: 'critical' })
        );
        assets?.filter((a: any) => a.status === 'Desativado').forEach((a: any) =>
            list.push({ icon: AlertTriangle, text: `Ativo offline: ${a.name}`, severity: 'critical' })
        );
        return list;
    }, [assets, routines]);

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <div className={styles.greeting}>
                    <h1 className={styles.greetTitle}>
                        Painel de Controle, {userName?.split(' ')[0] ?? 'Operador'}
                    </h1>
                    <p className={styles.greetSub}>
                        Gerenciamento de Infraestrutura Crítica • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className={styles.filters}>
                    <Filter size={14} className={styles.filterIcon} />
                    <select className={styles.filterSelect} value={period} onChange={e => setPeriod(e.target.value)}>
                        {PERIOD_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button className={styles.refreshBtn} onClick={() => mutate()} title="Sincronizar Dados">
                        <RefreshCw size={14} className={isLoading ? styles.spin : ''} />
                    </button>
                </div>
            </header>

            <section className={styles.kpiGrid}>
                <KpiCard label="Ativos em Inventário" value={stats.total} change="+4.2%" icon={Box} color="#6366f1" />
                <KpiCard
                    label="Custos c/ Licenças"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.licenseCost)}
                    subtitle={`Mensal estimado`}
                    icon={Zap}
                    color="#10b981"
                />
                <KpiCard label="Incidentes Críticos" value={stats.critical} change={stats.critical > 0 ? `+${stats.critical}` : '0'} icon={AlertTriangle} color="#ef4444" />
                <KpiCard label="Integridade de Backups" value={stats.ok} change="+0.5%" icon={CheckCircle2} color="#10b981" />
                <KpiCard label="SLA de Conformidade" value={`${stats.compliance}%`} icon={Shield} color={stats.compliance >= 90 ? '#10b981' : '#f59e0b'} />
            </section>

            <div className={styles.row2}>
                <article className={`${styles.chartCard} ${styles.colSpan2}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Activity size={18} color="#6366f1" />
                            <span className={styles.cardTitle}>Disponibilidade Operacional — {days} dias</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorOk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="ok" name="Sucesso" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOk)" />
                            <Area type="monotone" dataKey="falha" name="Falha" stroke="#ef4444" strokeWidth={2} fill="transparent" />
                        </AreaChart>
                    </ResponsiveContainer>
                </article>

                <article className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Zap size={18} color="#f59e0b" />
                            <span className={styles.cardTitle}>Saúde dos Ativos</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={(STATUS_COLORS as any)[entry.name] || '#ccc'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.pieLegend}>
                        {pieData.map((entry) => (
                            <div key={entry.name} className={styles.legendRow}>
                                <span className={styles.dot} style={{ background: (STATUS_COLORS as any)[entry.name] }} />
                                <span className={styles.legendLabel}>{entry.name}</span>
                                <span className={styles.legendVal}>{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </div>

            <div className={styles.row3}>
                <article className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Activity size={18} color="#a855f7" />
                            <span className={styles.cardTitle}>Mapa de Calor de Atividade</span>
                        </div>
                    </div>
                    <div className={styles.heatmap}>
                        {heatmap.map(({ day, hours }) => (
                            <div key={day} className={styles.heatmapRow}>
                                <span className={styles.heatmapDay}>{day}</span>
                                {hours.map((h: any) => (
                                    <div
                                        key={h.hour}
                                        className={styles.heatmapCell}
                                        style={{ background: HEATMAP_COLORS[h.value] }}
                                        title={`${day} ${h.hour}: ${h.value} ops`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </article>

                <article className={`${styles.chartCard} ${styles.alertsCard}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Shield size={18} color="#ef4444" />
                            <span className={styles.cardTitle}>Segurança e Alertas</span>
                        </div>
                        <span className={styles.alertCount}>{alerts.length}</span>
                    </div>
                    <div className={styles.alertList}>
                        {alerts.length === 0 ? (
                            <div className={styles.allClear}>
                                <CheckCircle2 size={32} color="#10b981" />
                                <span>Ambiente Seguro</span>
                            </div>
                        ) : (
                            alerts.map((a, i) => (
                                <div key={i} className={`${styles.alertItem} ${styles[a.severity]}`}>
                                    <a.icon size={16} />
                                    <span>{a.text}</span>
                                </div>
                            ))
                        )}
                    </div>
                </article>

                <article className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Cpu size={18} color="#6366f1" />
                            <span className={styles.cardTitle}>Infraestrutura</span>
                        </div>
                    </div>
                    <div className={styles.infraSimpleGrid}>
                        {[
                            { label: 'Servidores', icon: Server, val: assets?.filter((a: any) => a.type === 'Servidor').length ?? 0 },
                            { label: 'Rede', icon: Wifi, val: assets?.filter((a: any) => a.type === 'Rede').length ?? 0 },
                            { label: 'Storage', icon: HardDrive, val: assets?.filter((a: any) => a.type === 'Storage').length ?? 0 },
                        ].map(item => (
                            <div key={item.label} className={styles.infraSimpleItem}>
                                <item.icon size={16} />
                                <span>{item.label}: <strong>{item.val}</strong></span>
                            </div>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
}
