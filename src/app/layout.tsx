import type { Metadata, Viewport } from "next";
import { Playfair_Display, Geist } from "next/font/google";
import Script from "next/script";
import { AppProvider } from "../context/AppContext";
import { ToastProvider } from "../components/ui/Toast";
import "./globals.css";
import "../components/ui/form-controls.css";
import { cn } from "@/lib/utils";
import { rootMetadata } from "@/lib/seo";
import PwaProvider from "@/components/pwa/PwaProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = rootMetadata;
export const viewport: Viewport = { themeColor: '#0a0a0a' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", playfair.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            })();
          `}
        </Script>
        <ToastProvider>
          <PwaProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </PwaProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
