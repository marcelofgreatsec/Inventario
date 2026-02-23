import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'TI'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        const { name, icon } = await req.json();
        const cat = await prisma.docCategory.update({ where: { id: params.id }, data: { name, icon } });
        return NextResponse.json(cat);
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas Admin pode excluir' }, { status: 403 });
        }
        await prisma.docCategory.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 });
    }
}
