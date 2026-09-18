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
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
