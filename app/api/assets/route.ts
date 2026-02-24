import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const assets = await prisma.asset.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json(assets);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar ativos' }, { status: 500 });
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
        const { id, name, type, location, status, ip } = body;

        const asset = await prisma.asset.create({
            data: { id, name, type, location, status, ip }
        });

        // Create initial history record
        await prisma.assetHistory.create({
            data: {
                assetId: id,
                action: 'Criação',
                details: 'Ativo cadastrado no sistema',
            }
        });

        // Log the audit
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'CREATE_ASSET',
                resource: id,
            }
        });

        return NextResponse.json(asset);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar ativo' }, { status: 500 });
    }
}
