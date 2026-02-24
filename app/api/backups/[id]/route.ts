import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/backups/[id]
 * 
 * Securely deletes a specific backup routine and all its associated logs (via Cascade).
 * Restricted to ADMIN and TI roles.
 * 
 * Note: Next.js 15+ requires 'params' to be awaited.
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Rigorous Security Check
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json(
                { error: 'Acesso negado. Privilégios insuficientes para excluir rotinas.' },
                { status: 403 }
            );
        }

        // Await params for Next.js 15+ compatibility
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'ID da rotina é obrigatório.' },
                { status: 400 }
            );
        }

        // Execution: Atomic deletion of the routine
        // Associated logs are automatically deleted due to "onDelete: Cascade" in schema.prisma
        await prisma.backupRoutine.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Rotina de backup excluída com sucesso.' });
    } catch (error) {
        console.error('[BACKUP_DELETE_ERROR] Critical failure:', error);
        return NextResponse.json(
            { error: 'Falha interna ao excluir a rotina de backup.' },
            { status: 500 }
        );
    }
}
