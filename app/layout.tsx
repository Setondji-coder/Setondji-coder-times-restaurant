import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'TIMES Café Bar & Grill | Café d\'Exception, Bar à Cocktails & Grillades',
  description: 'Bienvenue chez TIMES Café Bar & Grill. Une expérience gastronomique raffinée dans un cadre sombre et chaleureux : cafés de terroir, cocktails signatures et viandes braisées au feu de bois.',
  openGraph: {
    title: 'TIMES Café Bar & Grill',
    description: 'Une expérience gastronomique raffinée dans un cadre sombre et chaleureux : cafés de terroir, cocktails signatures et viandes braisées au feu de bois.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIMES Café Bar & Grill',
    description: 'Cafés de terroir, cocktails signatures et grillades d\'exception.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr" className="scroll-smooth dark">
      <body className="bg-[#09090B] text-[#EDEDED] antialiased min-h-screen selection:bg-[#7D0A1C] selection:text-white" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  var msg = (e && (e.message || (e.error && e.error.message))) || '';
                  if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Loading chunk') !== -1) {
                    var last = parseInt(sessionStorage.getItem('chunk_load_reload') || '0', 10);
                    var now = Date.now();
                    if (now - last > 3000) {
                      sessionStorage.setItem('chunk_load_reload', String(now));
                      window.location.reload();
                    }
                  }
                });
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
