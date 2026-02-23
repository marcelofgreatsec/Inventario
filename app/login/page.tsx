'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';
import styles from '@/styles/Login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Credenciais inválidas. Verifique seu email e senha.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <ShieldCheck size={40} color="var(--accent-primary)" />
                        <span className={styles.logoName}>Fgreat</span>
                    </div>
                    <h1 className={styles.title}>Bem-vindo de volta</h1>
                    <p className={styles.subtitle}>Entre com sua conta de TI para gerenciar ativos</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">Email Corporativo</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="admin@fgreat.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="password">Senha</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                id="password"
                                type="password"
                                className={styles.input}
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto' }} /> : 'Entrar no Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
}
