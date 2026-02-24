import { NextResponse } from 'next/server';

// NextAuth has been replaced by Supabase Auth.
// This stub prevents broken references from returning 500 errors.
export async function GET() {
    return NextResponse.json({ error: 'Auth migrated to Supabase' }, { status: 404 });
}
export async function POST() {
    return NextResponse.json({ error: 'Auth migrated to Supabase' }, { status: 404 });
}
