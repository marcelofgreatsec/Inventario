'use client';

import MainLayout from '@/components/layout/MainLayout';
import Administration from '@/modules/admin/Administration';

export default function AdminPage() {
    return (
        <MainLayout>
            <Administration />
        </MainLayout>
    );
}
