import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";;


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Portfolio Admin',
  description: 'Tableau de bord administrateur pour gérer mon portfolio personnel avec toutes les fonctionnalités CRUD nécessaires',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Providers>
          <div className="fixed right-4 z-50">
          </div>
          <main className="flex-1 pt-6 md:pt-16 bg-background text-foreground">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
