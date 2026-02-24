import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const routines = await prisma.backupRoutine.findMany({
            include: { logs: { orderBy: { timestamp: 'desc' }, take: 1 } },
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json(routines);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar rotinas' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role === 'VIEWER') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { name, type, frequency, responsible } = body;

        const routine = await prisma.backupRoutine.create({
            data: { name, type, frequency, responsible, status: 'Pendente' }
        });

        return NextResponse.json(routine);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar rotina' }, { status: 500 });
    }
}
