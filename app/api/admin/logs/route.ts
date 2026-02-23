import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const logs = await prisma.auditLog.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar auditoria' }, { status: 500 });
    }
}
