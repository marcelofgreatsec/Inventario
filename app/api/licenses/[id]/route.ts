import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/licenses/[id]
 * Update a specific license.
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await context.params;
        const body = await req.json();

        const updateData: any = { ...body };
        if (body.totalSeats !== undefined) updateData.totalSeats = parseInt(body.totalSeats) || 1;
        if (body.usedSeats !== undefined) updateData.usedSeats = parseInt(body.usedSeats) || 0;
        if (body.monthlyCost !== undefined) updateData.monthlyCost = parseFloat(body.monthlyCost) || 0.0;
        if (body.renewalDate !== undefined) updateData.renewalDate = body.renewalDate ? new Date(body.renewalDate) : null;

        const license = await prisma.license.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(license);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar licença' }, { status: 500 });
    }
}

/**
 * DELETE /api/licenses/[id]
 * Delete a specific license.
 */
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id } = await context.params;

        await prisma.license.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Licença excluída com sucesso' });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao excluir licença' }, { status: 500 });
    }
}
