'use client';

import MainLayout from '@/components/layout/MainLayout';
import BackupManagement from '@/modules/backups/BackupManagement';

export default function BackupsPage() {
    return (
        <MainLayout>
            <BackupManagement />
        </MainLayout>
    );
}
