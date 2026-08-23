import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'HSE Management System',
  description: 'Hệ thống Quản lý An toàn, Sức khỏe và Môi trường',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  
  return (
    <html lang="vi">
      <body>
        {/* We pass user info to a client provider or layout inside specific pages if needed */}
        {children}
      </body>
    </html>
  );
}
