'use client';

import MainLayout from '@/components/layout/MainLayout';
import AssetInventory from '@/modules/assets/AssetInventory';

export default function InventarioPage() {
    return (
        <MainLayout>
            <AssetInventory />
        </MainLayout>
    );
}
