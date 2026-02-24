import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const categories = await prisma.docCategory.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(categories);
    } catch (e: any) {
        console.error('DocCategory GET error:', e?.message);
        return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        const { name, icon } = await req.json();
        const cat = await prisma.docCategory.create({ data: { name, icon: icon ?? 'folder' } });
        return NextResponse.json(cat);
    } catch (e: any) {
        console.error('DocCategory POST error:', e?.message);
        return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 });
    }
}
