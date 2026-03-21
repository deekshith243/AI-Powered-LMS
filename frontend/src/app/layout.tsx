import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI-Powered LMS',
  description: 'A Next.js 14 Learning Management System powered by Hugging Face AI.',
};

import ErrorBoundary from './components/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 flex flex-col min-h-screen`}>
        <ErrorBoundary>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
