import MainLayout from '@/components/layout/MainLayout';
import LicenseManagement from '@/modules/licenses/LicenseManagement';

export const metadata = {
    title: 'Gestão de Licenças | Fgreat Inventário',
    description: 'Gerenciamento centralizado de softwares, assinaturas e custos operacionais.',
};

export default function LicensesPage() {
    return (
        <MainLayout>
            <LicenseManagement />
        </MainLayout>
    );
}
