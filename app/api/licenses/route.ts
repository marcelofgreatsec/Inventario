import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/licenses
 * Fetch all licenses.
 */
export async function GET() {
    try {
        const licenses = await prisma.license.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(licenses);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar licenças' }, { status: 500 });
    }
}

/**
 * POST /api/licenses
 * Create a new license.
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Sessão expirada ou não encontrada' }, { status: 401 });
        }

        const userRole = user.user_metadata?.role;
        if (!['ADMIN', 'TI'].includes(userRole)) {
            return NextResponse.json({
                error: `Não autorizado. Sua função (${userRole || 'Padrão'}) não tem permissão para criar licenças.`
            }, { status: 403 });
        }

        const body = await req.json();
        console.log('[LICENSE_POST_BODY]', body);
        const { name, provider, key, totalSeats, usedSeats, monthlyCost, renewalDate, status, responsible, notes } = body;

        if (!name || !provider) {
            return NextResponse.json({ error: 'Nome e Provedor são campos obrigatórios' }, { status: 400 });
        }

        let parsedRenewalDate: Date | null = null;
        if (renewalDate) {
            parsedRenewalDate = new Date(renewalDate);
            if (isNaN(parsedRenewalDate.getTime())) {
                return NextResponse.json({ error: 'Data de renovação inválida' }, { status: 400 });
            }
        }

        const license = await prisma.license.create({
            data: {
                name,
                provider,
                key,
                totalSeats: parseInt(totalSeats as string) || 1,
                usedSeats: parseInt(usedSeats as string) || 0,
                monthlyCost: parseFloat(monthlyCost as string) || 0.0,
                renewalDate: parsedRenewalDate,
                status: status || 'Ativo',
                responsible: responsible || null,
                notes: notes || null
            }
        });

        return NextResponse.json(license);
    } catch (error: any) {
        console.error('[LICENSE_CREATE_ERROR] Full error:', error);
        return NextResponse.json({
            error: 'Erro no servidor ao criar licença',
            details: error?.message || String(error)
        }, { status: 500 });
    }
}
