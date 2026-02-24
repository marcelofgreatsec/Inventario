import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const type = searchParams.get('type');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            if (type === 'recovery') {
                // Redirect to password update page
                return NextResponse.redirect(`${origin}/auth/update-password`);
            }
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
