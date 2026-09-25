import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Car Mechanic Chatbot',
  description: 'Virtual car mechanic assistant for vehicle troubleshooting, diagnosis, and mechanic booking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
