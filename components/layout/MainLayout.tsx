'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.main}>
                <Navbar />
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
