import { Inter } from 'next/font/google';
import { ThemeProvider } from '../hooks/use-theme';
import { Providers } from '../components/Providers';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fgreat | IT Asset & Backup Management',
  description: 'Premium internal platform for IT assets and backup management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
