import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import ToastContainer from '@/components/ui/ToastContainer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { GlobalModals } from '@/components/ui/GlobalModals';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lema — Segundo Cerebro Matemático',
  description:
    'Plataforma privada de productividad con editor por bloques estilo Notion, compilación LaTeX en el navegador (WASM) y aceleración por IA Gemini.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lema',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('lema-theme') || 'dark';
    var isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-screen bg-canvas text-ink-primary font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-700 dark:selection:text-cyan-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
          <GlobalModals />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
