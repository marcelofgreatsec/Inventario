import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Reveal credential password (with access log)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Sem permissão para ver credencial' }, { status: 403 });
        }

        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc || doc.type !== 'Credencial') {
            return NextResponse.json({ error: 'Documento não é uma credencial' }, { status: 400 });
        }

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: user.id, action: 'VIEW_CREDENTIAL' },
        });

        return NextResponse.json({ credUser: doc.credUser, credPass: doc.credPass });
    } catch (e) {
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}
