import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Reveal credential password (with access log)
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'TI'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Sem permissão para ver credencial' }, { status: 403 });
        }

        const doc = await prisma.document.findUnique({ where: { id: params.id } });
        if (!doc || doc.type !== 'Credencial') {
            return NextResponse.json({ error: 'Documento não é uma credencial' }, { status: 400 });
        }

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: (session.user as any).id, action: 'VIEW_CREDENTIAL' },
        });

        // Return raw credential (it's hashed, so we can't reverse it — we return the stored value)
        // In a real system you'd use symmetric encryption; here we expose the hash for demonstration
        // and note that the "reveal" is really just confirming access was logged
        return NextResponse.json({ credUser: doc.credUser, credPass: doc.credPass });
    } catch (e) {
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}
