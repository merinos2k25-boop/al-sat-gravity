import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Nunito } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-rounded' });

export const metadata: Metadata = {
  title: 'Ticaret Takip',
  description: 'Alış ve satışlarınızı kolayca takip edin — HAKAN KORKMAZ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ticaret Takip',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f1117',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${nunito.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
