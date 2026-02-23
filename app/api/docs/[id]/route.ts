import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        const doc = await prisma.document.findUnique({
            where: { id: params.id },
            include: { category: true, accessLogs: { orderBy: { timestamp: 'desc' }, take: 10 } },
        });
        if (!doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: (session?.user as any)?.id, action: 'VIEW' },
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e) {
        return NextResponse.json({ error: 'Erro' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'TI'].includes((session.user as any).role)) {
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
            data: { documentId: doc.id, userId: (session.user as any).id, action: 'EDIT' },
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas Admin pode excluir' }, { status: 403 });
        }
        await prisma.document.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
    }
}
