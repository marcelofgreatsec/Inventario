import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const doc = await prisma.document.findUnique({
            where: { id: params.id },
            include: { category: true, accessLogs: { orderBy: { timestamp: 'desc' }, take: 10 } },
        });
        if (!doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: user?.id, action: 'VIEW' },
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e) {
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { credPass, ...rest } = body;

        let encryptedPass: string | undefined;
        if (credPass && credPass !== '••••••••' && rest.type === 'Credencial') {
            encryptedPass = await bcrypt.hash(credPass, 12);
        }

        const doc = await prisma.document.update({
            where: { id: params.id },
            data: { ...rest, ...(encryptedPass ? { credPass: encryptedPass } : {}) },
            include: { category: true },
        });

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: user.id, action: 'EDIT' },
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas Admin pode excluir' }, { status: 403 });
        }
        await prisma.document.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
    }
}
