import { Inter, JetBrains_Mono } from 'next/font/google';

import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Rehai',
    template: '%s · Rehai',
  },
  description: 'Sistema operativo para clínicas de readaptación deportiva en México.',
  applicationName: 'Rehai',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Script anti-FOUC: lee el tema de localStorage y lo aplica ANTES de hidratar
 * para evitar flash dark→light. Debe correr antes del primer render del body.
 */
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('reha-theme') || 'dark';
    document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="es-MX"
      data-theme="dark"
      data-tenant="movewell"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg text-text flex min-h-full flex-col">{children}</body>
    </html>
  );
}
