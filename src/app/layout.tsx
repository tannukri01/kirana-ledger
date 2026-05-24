import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Providers } from '../components/Providers';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kirana Ledger — Digital Udhaar Manager',
  description: 'Manage your shop credit and customer ledger digitally',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
