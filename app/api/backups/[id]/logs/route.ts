import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role === 'VIEWER') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = params;
        const { status, evidence, logOutput } = await req.json();

        const log = await prisma.backupLog.create({
            data: {
                routineId: id,
                status,
                evidence,
                logOutput,
            }
        });

        await prisma.backupRoutine.update({
            where: { id },
            data: {
                status,
                lastRun: new Date()
            }
        });

        return NextResponse.json(log);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao registrar execução' }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const logs = await prisma.backupLog.findMany({
            where: { routineId: id },
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 });
    }
}
