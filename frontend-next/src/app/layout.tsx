import type { Metadata } from 'next';
import './globals.css';
import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'CareerPrepAI - Professional Assessment',
  description: 'AI-driven career preparation and mock interviews.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClientLayoutWrapper>
        {children}
      </ClientLayoutWrapper>
    </html>
  );
}
