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
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { name, provider, key, totalSeats, usedSeats, monthlyCost, renewalDate, status, responsible, notes } = body;

        const license = await prisma.license.create({
            data: {
                name,
                provider,
                key,
                totalSeats: parseInt(totalSeats) || 1,
                usedSeats: parseInt(usedSeats) || 0,
                monthlyCost: parseFloat(monthlyCost) || 0.0,
                renewalDate: renewalDate ? new Date(renewalDate) : null,
                status: status || 'Ativo',
                responsible,
                notes
            }
        });

        return NextResponse.json(license);
    } catch (error) {
        console.error('[LICENSE_CREATE_ERROR]', error);
        return NextResponse.json({ error: 'Erro ao criar licença' }, { status: 500 });
    }
}
