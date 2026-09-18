import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THERMO-LIFT | Digital Twin Dashboard',
  description: 'AI-Enabled Well-to-Surface Digital Twin & Predictive Analytics for Baghewala Field',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased selection:bg-sky-200 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
