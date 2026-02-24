import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

/**
 * Authentication Configuration
 * 
 * Implements a Secure-by-Design approach with:
 * 1. JWT-based stateless sessions for performance.
 * 2. Strict credential validation.
 * 3. Role-based session enrichment.
 * 4. Centralized login page for all protected routes.
 */

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        CredentialsProvider({
            name: 'Inventário Login',
            credentials: {
                email: { label: "E-mail Corporativo", type: "email", placeholder: "usuario@fgreat.com" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('As credenciais são obrigatórias.');
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase() }
                    });

                    if (!user) {
                        // Secure response: don't reveal if user exists
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        // Audit failed login attempt if needed
                        return null;
                    }

                    // Success: Return sanitized user data
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('[AUTH_ERROR] Critical failure during authorization:', error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login?error=AuthError',
    },
    debug: process.env.NODE_ENV === 'development',
};
