import { NextRequest, NextResponse } from 'next/server';

// NextAuth has been replaced by Supabase Auth.
// This stub prevents broken references from returning 500 errors.
// Adding Promise params for Next.js 15+ compatibility.
export async function GET(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
    return NextResponse.json({ error: 'Auth migrated to Supabase' }, { status: 404 });
}
export async function POST(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
    return NextResponse.json({ error: 'Auth migrated to Supabase' }, { status: 404 });
}
