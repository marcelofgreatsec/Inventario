import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
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
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas Admin pode excluir' }, { status: 403 });
        }
        await prisma.docCategory.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 });
    }
}
