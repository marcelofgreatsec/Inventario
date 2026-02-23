import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        const where: any = {};
        if (category && category !== 'all') where.categoryId = category;
        if (type && type !== 'all') where.type = type;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { tags: { contains: search } },
            ];
        }

        const docs = await prisma.document.findMany({
            where,
            include: { category: true },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(docs.map(d => ({ ...d, credPass: d.credPass ? '••••••••' : null })));
    } catch (e: any) {
        console.error('Document GET error:', e?.message);
        return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'TI'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { title, categoryId, type, description, tags, content, fileUrl, fileType, credUser, credPass, responsible } = body;

        let encryptedPass: string | undefined;
        if (credPass && type === 'Credencial') {
            encryptedPass = await bcrypt.hash(credPass, 12);
        }

        const doc = await prisma.document.create({
            data: {
                title, categoryId, type,
                description: description || null,
                tags: tags || null,
                content: content || null,
                fileUrl: fileUrl || null,
                fileType: fileType || null,
                credUser: credUser || null,
                credPass: encryptedPass || null,
                responsible: responsible || null,
                createdBy: (session.user as any).id,
            },
            include: { category: true },
        });

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: (session.user as any).id, action: 'CREATE' },
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e: any) {
        console.error('Document POST error:', e?.message);
        return NextResponse.json({ error: 'Erro ao criar documento: ' + e?.message }, { status: 500 });
    }
}
