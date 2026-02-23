import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'TI'].includes((session.user as any).role)) {
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
