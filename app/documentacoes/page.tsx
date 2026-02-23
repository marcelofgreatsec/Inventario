import MainLayout from '@/components/layout/MainLayout';
import DocumentList from '@/modules/docs/DocumentList';

export const metadata = {
    title: 'Documentações | Fgreat',
    description: 'Base de conhecimento técnico e documentações internas',
};

export default function DocsPage() {
    return (
        <MainLayout>
            <DocumentList />
        </MainLayout>
    );
}
