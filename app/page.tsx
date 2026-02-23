'use client';

import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/modules/dashboard/Dashboard';

export default function Home() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}
