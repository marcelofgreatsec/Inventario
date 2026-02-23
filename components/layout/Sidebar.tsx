'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    Box,
    Database,
    Share2,
    Settings,
    BookOpen,
    ChevronRight,
    LogOut
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Inventário', icon: Box, href: '/inventario' },
    { name: 'Backups', icon: Database, href: '/backups' },
    { name: 'Infraestrutura', icon: Share2, href: '/infraestrutura' },
    { name: 'Documentações', icon: BookOpen, href: '/documentacoes' },
    { name: 'Administração', icon: Settings, href: '/administracao' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user as any;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <div className={styles.iconBox}>
                    <LayoutDashboard size={20} />
                </div>
                <span className={styles.logoText}>Fgreat</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    if (item.href === '/administracao' && user?.role !== 'ADMIN') return null;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
                        >
                            <item.icon size={20} className={styles.navIcon} />
                            <span>{item.name}</span>
                            {isActive && <ChevronRight size={16} className={styles.navChevron} />}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user?.name?.substring(0, 1).toUpperCase() || 'U'}
                    </div>
                    <div className={styles.userMeta}>
                        <span className={styles.userName}>{user?.name || 'Sistema'}</span>
                        <span className={styles.userRole}>{user?.role || 'Usuário'}</span>
                    </div>
                </div>
                <button
                    className={styles.logoutBtn}
                    onClick={() => signOut({ callbackUrl: '/login' })}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
