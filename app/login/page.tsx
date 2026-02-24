'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import styles from '@/styles/Login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgot, setIsForgot] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError('Credenciais inválidas. Verifique seu email e senha.');
            setIsLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Informe seu email para redefinir a senha.');
            return;
        }
        setIsLoading(true);
        setError('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

        setIsLoading(false);

        if (error) {
            setError('Erro ao enviar email. Tente novamente.');
        } else {
            setSuccessMsg('Email de redefinição enviado! Verifique sua caixa de entrada.');
            setIsForgot(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            {/* Animated background particles */}
            <div className={styles.bgOrb1} />
            <div className={styles.bgOrb2} />
            <div className={styles.bgOrb3} />
            <div className={styles.bgGrid} />

            <div className={`${styles.loginCard} ${mounted ? styles.mounted : ''}`}>
                {/* Logo */}
                <div className={styles.logoWrapper}>
                    <div className={styles.logoIcon}>
                        <ShieldCheck size={28} />
                    </div>
                    <span className={styles.logoName}>Fgreat</span>
                    <span className={styles.logoBadge}>IT</span>
                </div>

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {isForgot ? 'Redefinir senha' : 'Bem-vindo de volta'}
                    </h1>
                    <p className={styles.subtitle}>
                        {isForgot
                            ? 'Informe seu email para receber o link de redefinição'
                            : 'Acesse o painel de gestão de TI'}
                    </p>
                </div>

                {/* Feedback messages */}
                {error && (
                    <div className={styles.errorBanner}>
                        <span className={styles.errorDot} />
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className={styles.successBanner}>
                        <span className={styles.successDot} />
                        {successMsg}
                    </div>
                )}

                {/* Form */}
                <form
                    className={styles.form}
                    onSubmit={isForgot ? handleForgotPassword : handleLogin}
                >
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">
                            Email Corporativo
                        </label>
                        <div className={styles.inputWrapper}>
                            <Mail size={16} className={styles.inputIcon} />
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                placeholder="usuario@fgreat.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {!isForgot && (
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="password">
                                Senha
                            </label>
                            <div className={styles.inputWrapper}>
                                <Lock size={16} className={styles.inputIcon} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`${styles.input} ${styles.inputPassword}`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className={styles.spinner} />
                        ) : (
                            <>
                                {isForgot ? 'Enviar email' : 'Entrar no Sistema'}
                                <ArrowRight size={17} className={styles.btnArrow} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer links */}
                <div className={styles.formFooter}>
                    {isForgot ? (
                        <button
                            className={styles.linkBtn}
                            onClick={() => { setIsForgot(false); setError(''); }}
                        >
                            ← Voltar para o login
                        </button>
                    ) : (
                        <button
                            className={styles.linkBtn}
                            onClick={() => { setIsForgot(true); setError(''); }}
                        >
                            Esqueceu a senha?
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
