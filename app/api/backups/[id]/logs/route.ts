import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role === 'VIEWER') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await context.params;
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
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
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
