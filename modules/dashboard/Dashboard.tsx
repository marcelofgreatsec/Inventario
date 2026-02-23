'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import {
    Server,
    Database,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Activity,
    Network,
    HardDrive,
    Shield,
    Filter,
    RefreshCw,
    ArrowUpRight,
    Zap,
    Box,
    Cpu,
    Wifi,
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
    Legend,
} from 'recharts';
import styles from './Dashboard.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PERIOD_OPTIONS = ['7 dias', '30 dias', '90 dias'];

// Generate fake 30-day history for demo charts
function genHistory(days: number) {
    return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        return {
            date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            ok: Math.floor(Math.random() * 10 + 8),
            falha: Math.floor(Math.random() * 3),
        };
    });
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOURS = ['00h', '04h', '08h', '12h', '16h', '20h'];

function genHeatmap() {
    return WEEK_DAYS.map((day) => ({
        day,
        hours: HOURS.map((hour) => ({
            hour,
            value: Math.floor(Math.random() * 6),
        })),
    }));
}

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

const BAR_DATA = [
    { tipo: 'Local', total: 24, ok: 21, falha: 3 },
    { tipo: 'Nuvem', total: 18, ok: 17, falha: 1 },
    { tipo: 'Híbrido', total: 12, ok: 10, falha: 2 },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function KpiCard({
    label,
    value,
    change,
    icon: Icon,
    color,
    subtitle,
}: {
    label: string;
    value: string | number;
    change?: string;
    icon: any;
    color: string;
    subtitle?: string;
}) {
    const positive = change?.startsWith('+') ?? true;
    return (
        <div className={styles.kpiCard} style={{ '--accent': color } as any}>
            <div className={styles.kpiTop}>
                <div className={styles.kpiIconWrap} style={{ background: `${color}18` }}>
                    <Icon size={22} color={color} />
                </div>
                {change && (
                    <span className={`${styles.kpiBadge} ${positive ? styles.badgeGreen : styles.badgeRed}`}>
                        {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {change}
                    </span>
                )}
            </div>
            <div className={styles.kpiValue}>{value}</div>
            <div className={styles.kpiLabel}>{label}</div>
            {subtitle && <div className={styles.kpiSub}>{subtitle}</div>}
            <div className={styles.kpiBar} style={{ background: `${color}22` }}>
                <div className={styles.kpiBarFill} style={{ background: color, width: '65%' }} />
            </div>
        </div>
    );
}

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
    const { data: session } = useSession();
    const { data: assets, isLoading: loadingAssets } = useSWR('/api/assets', fetcher);
    const { data: routines, isLoading: loadingRoutines, mutate } = useSWR('/api/backups', fetcher);

    const [period, setPeriod] = useState('30 dias');
    const [filterAsset, setFilterAsset] = useState('Todos');
    const [filterBackup, setFilterBackup] = useState('Todos');

    const days = period === '7 dias' ? 7 : period === '30 dias' ? 30 : 90;
    const history = useMemo(() => genHistory(days), [days]);
    const heatmap = useMemo(() => genHeatmap(), []);

    // ── Derived KPIs ────────────────────────────────────────────────────────────
    const totalAssets = assets?.length ?? 0;
    const criticalAssets = assets?.filter((a: any) => a.status === 'Desativado').length ?? 0;
    const backupsOk = routines?.filter((r: any) => r.status === 'Sucesso').length ?? 0;
    const backupsFail = routines?.filter((r: any) => r.status === 'Erro').length ?? 0;
    const totalRoutines = routines?.length ?? 0;
    const compliance = totalRoutines > 0 ? Math.round((backupsOk / totalRoutines) * 100) : 0;

    const lastRunRoutine = routines
        ?.filter((r: any) => r.lastRun)
        .sort((a: any, b: any) => new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime())[0];

    const lastRunLabel = lastRunRoutine
        ? new Date(lastRunRoutine.lastRun).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : 'Nenhum';

    // ── Pie Data ─────────────────────────────────────────────────────────────────
    const pieData = useMemo(() => {
        const groups: Record<string, number> = { Ativo: 0, Manutenção: 0, Desativado: 0 };
        assets?.forEach((a: any) => { if (groups[a.status] !== undefined) groups[a.status]++; });
        return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }, [assets]);

    // ── Infra Stats ───────────────────────────────────────────────────────────
    const infraStats = useMemo(() => ({
        servers: assets?.filter((a: any) => a.type === 'Servidor').length ?? 0,
        network: assets?.filter((a: any) => a.type === 'Rede').length ?? 0,
        storage: assets?.filter((a: any) => a.type === 'Storage').length ?? 0,
        notebooks: assets?.filter((a: any) => a.type === 'Notebook').length ?? 0,
    }), [assets]);

    // ── Alerts ───────────────────────────────────────────────────────────────────
    const alerts = useMemo(() => {
        const list: { icon: any; text: string; severity: 'critical' | 'warn' }[] = [];
        routines?.forEach((r: any) => {
            if (r.status === 'Erro') list.push({ icon: XCircle, text: `Falha: ${r.name}`, severity: 'critical' });
        });
        assets?.filter((a: any) => a.status === 'Desativado').forEach((a: any) => {
            list.push({ icon: AlertTriangle, text: `Ativo desativado: ${a.name}`, severity: 'critical' });
        });
        assets?.filter((a: any) => a.status === 'Manutenção').forEach((a: any) => {
            list.push({ icon: Clock, text: `Em manutenção: ${a.name}`, severity: 'warn' });
        });
        return list;
    }, [assets, routines]);

    const isLoading = loadingAssets || loadingRoutines;

    return (
        <div className={styles.page}>
            {/* ── Top bar ───────────────────────────────────────────────────────── */}
            <div className={styles.topBar}>
                <div className={styles.greeting}>
                    <h1 className={styles.greetTitle}>
                        Olá, {session?.user?.name?.split(' ')[0] ?? 'Comandante'} 👋
                    </h1>
                    <p className={styles.greetSub}>Visão executiva · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className={styles.filters}>
                    <Filter size={14} style={{ color: 'var(--accent-primary)' }} />
                    <select className={styles.filterSelect} value={period} onChange={e => setPeriod(e.target.value)}>
                        {PERIOD_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button className={styles.refreshBtn} onClick={() => mutate()} title="Atualizar">
                        <RefreshCw size={14} className={isLoading ? styles.spin : ''} />
                    </button>
                </div>
            </div>

            {/* ── KPI Grid ────────────────────────────────────────────────────── */}
            <div className={styles.kpiGrid}>
                <KpiCard label="Ativos Totais" value={totalAssets} change="+12%" icon={Box} color="#6366f1" />
                <KpiCard label="Ativos Críticos" value={criticalAssets} change={criticalAssets > 0 ? `+${criticalAssets}` : '0'} icon={AlertTriangle} color="#ef4444" />
                <KpiCard label="Backups OK" value={backupsOk} change="+2%" icon={CheckCircle2} color="#10b981" />
                <KpiCard label="Conformidade" value={`${compliance}%`} icon={Shield} color={compliance >= 80 ? '#10b981' : '#ef4444'} />
            </div>

            {/* ── Row 2 : Line + Pie ───────────────────────────────────────────── */}
            <div className={styles.row2}>
                {/* Line Chart */}
                <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Activity size={18} color="#6366f1" />
                            <span className={styles.cardTitle}>Histórico de Backups — últimos {days} dias</span>
                        </div>
                        <a className={styles.linkBtn}>Ver tudo <ArrowUpRight size={14} /></a>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gOk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} interval={Math.floor(days / 6)} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="ok" name="Sucesso" stroke="#10b981" fill="url(#gOk)" strokeWidth={2} dot={false} />
                            <Area type="monotone" dataKey="falha" name="Falha" stroke="#ef4444" fill="url(#gFail)" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Zap size={18} color="#f59e0b" />
                            <span className={styles.cardTitle}>Status dos Ativos</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={(STATUS_COLORS as any)[entry.name] ?? '#6366f1'} />
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
                </div>
            </div>

            {/* ── Row 3 : Bar + Heatmap + Alerts ──────────────────────────────── */}
            <div className={styles.row3}>
                {/* Bar Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Database size={18} color="#3b82f6" />
                            <span className={styles.cardTitle}>Backups por Tipo</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={BAR_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="tipo" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="ok" name="Sucesso" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="falha" name="Falha" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Heatmap */}
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <Activity size={18} color="#a855f7" />
                            <span className={styles.cardTitle}>Atividade Semanal</span>
                        </div>
                    </div>
                    <div className={styles.heatmap}>
                        <div className={styles.heatmapHours}>
                            {HOURS.map(h => <span key={h}>{h}</span>)}
                        </div>
                        {heatmap.map(({ day, hours }) => (
                            <div key={day} className={styles.heatmapRow}>
                                <span className={styles.heatmapDay}>{day}</span>
                                {hours.map(({ hour, value }) => (
                                    <div
                                        key={hour}
                                        className={styles.heatmapCell}
                                        style={{ background: HEATMAP_COLORS[value] }}
                                        title={`${day} ${hour}: ${value} execuções`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className={styles.heatmapLegend}>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Menos</span>
                        {HEATMAP_COLORS.map((c, i) => <div key={i} className={styles.heatmapLegendCell} style={{ background: c }} />)}
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Mais</span>
                    </div>
                </div>

                {/* Alerts */}
                <div className={`${styles.chartCard} ${styles.alertsCard}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitleWrap}>
                            <AlertTriangle size={18} color="#ef4444" />
                            <span className={styles.cardTitle}>Alertas Inteligentes</span>
                        </div>
                        <span className={styles.alertCount}>{alerts.length}</span>
                    </div>
                    <div className={styles.alertList}>
                        {alerts.length === 0 ? (
                            <div className={styles.allClear}>
                                <CheckCircle2 size={28} color="#10b981" />
                                <span>Tudo operacional</span>
                            </div>
                        ) : (
                            alerts.map((a, i) => (
                                <div key={i} className={`${styles.alertItem} ${a.severity === 'critical' ? styles.alertCritical : styles.alertWarn}`}>
                                    <a.icon size={15} />
                                    <span>{a.text}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Row 4 : Infra Status ─────────────────────────────────────────── */}
            <div className={styles.row4}>
                <div className={styles.infraHeader}>
                    <Cpu size={18} color="#6366f1" />
                    <span className={styles.cardTitle}>Status da Infraestrutura</span>
                </div>
                <div className={styles.infraGrid}>
                    {[
                        { label: 'Servidores', value: infraStats.servers, icon: Server, color: '#6366f1' },
                        { label: 'Rede', value: infraStats.network, icon: Wifi, color: '#3b82f6' },
                        { label: 'Storage', value: infraStats.storage, icon: HardDrive, color: '#10b981' },
                        { label: 'Notebooks', value: infraStats.notebooks, icon: Cpu, color: '#f59e0b' },
                        {
                            label: 'Status Geral',
                            value: alerts.some(a => a.severity === 'critical') ? '⚠ Atenção' : '✓ Normal',
                            icon: Shield,
                            color: alerts.some(a => a.severity === 'critical') ? '#ef4444' : '#10b981',
                        },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className={styles.infraItem}>
                            <div className={styles.infraIcon} style={{ background: `${color}18`, color }}>
                                <Icon size={20} />
                            </div>
                            <div className={styles.infraValue}>{value}</div>
                            <div className={styles.infraLabel}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
