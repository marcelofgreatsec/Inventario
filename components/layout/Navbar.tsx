import { useState, useRef, useEffect } from 'react';
import { Bell, Moon, Sun, Search, LayoutGrid, X } from 'lucide-react';
import { useTheme } from '../../hooks/use-theme';
import styles from './Navbar.module.css';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [appsOpen, setAppsOpen] = useState(false);

    const getPageTitle = (path: string) => {
        switch (path) {
            case '/': return 'Dashboard';
            case '/inventario': return 'Inventário de Ativos';
            case '/backups': return 'Gestão de Backups';
            case '/infraestrutura': return 'Infraestrutura';
            case '/documentacoes': return 'Documentações';
            case '/administracao': return 'Administração';
            default: return 'Sistema';
        }
    };

    return (
        <header className={styles.navbar}>
            <div className={styles.titleContainer}>
                <h1 className={styles.pageTitle}>{getPageTitle(pathname)}</h1>
                <span className={styles.breadcrumb}>Fgreat / {getPageTitle(pathname)}</span>
            </div>

            <div className={styles.actions}>
                <div className={`${styles.searchGroup} ${searchOpen ? styles.searchExpanded : ''}`}>
                    <button className={styles.iconButton} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                        {searchOpen ? <X size={20} strokeWidth={2} /> : <Search size={20} strokeWidth={2} />}
                    </button>
                    {searchOpen && (
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar ativo, backup ou doc..."
                            className={styles.searchBar}
                        />
                    )}
                </div>

                <button className={styles.iconButton} onClick={toggleTheme} aria-label="Toggle Theme">
                    {theme === 'dark' ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                </button>

                <div className={styles.popoverGroup}>
                    <button className={styles.iconButton} onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
                        <Bell size={20} strokeWidth={2} />
                        <span className={styles.badge} />
                    </button>
                    {notifOpen && (
                        <div className={styles.popover}>
                            <h4 className={styles.popoverTitle}>Notificações</h4>
                            <div className={styles.popoverItem}>
                                <div className={styles.dot} />
                                <span>Backup finalizado com sucesso</span>
                            </div>
                            <div className={styles.popoverItem}>
                                <div className={`${styles.dot} ${styles.dotWarning}`} />
                                <span>Servidor SRV-01 em atenção</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.popoverGroup}>
                    <button className={styles.iconButton} onClick={() => setAppsOpen(!appsOpen)} aria-label="Modules">
                        <LayoutGrid size={20} strokeWidth={2} />
                    </button>
                    {appsOpen && (
                        <div className={`${styles.popover} ${styles.popoverGrid}`}>
                            <div className={styles.gridItem}>
                                <LayoutGrid size={24} />
                                <span>Dashboard</span>
                            </div>
                            <div className={styles.gridItem}>
                                <Bell size={24} />
                                <span>Alertas</span>
                            </div>
                            <div className={styles.gridItem}>
                                <Search size={24} />
                                <span>Busca</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
