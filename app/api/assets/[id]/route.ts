import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role === 'VIEWER') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await req.json();
        const { name, type, location, status, ip } = body;

        const currentAsset = await prisma.asset.findUnique({ where: { id } });

        const asset = await prisma.asset.update({
            where: { id },
            data: { name, type, location, status, ip }
        });

        // Log history if status changed
        if (currentAsset?.status !== status) {
            await prisma.assetHistory.create({
                data: {
                    assetId: id,
                    action: 'Mudança de Status',
                    details: `Status alterado de ${currentAsset?.status} para ${status}`,
                }
            });
        }

        return NextResponse.json(asset);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar ativo' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas administradores podem excluir ativos' }, { status: 403 });
        }

        const { id } = await context.params;
        await prisma.asset.delete({ where: { id } });

        return NextResponse.json({ message: 'Ativo excluído com sucesso' });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao excluir ativo' }, { status: 500 });
    }
}
