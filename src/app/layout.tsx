import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { AppProvider } from "../context/AppContext";
import { ToastProvider } from "../components/ui/Toast";
import "./globals.css";
import "../components/ui/form-controls.css";
import { cn } from "@/lib/utils";
import { rootMetadata } from "@/lib/seo";
import PwaProvider from "@/components/pwa/PwaProvider";

// Keep the original typefaces available when Google font fetching is offline.
const playfair = localFont({
  src: "../../public/fonts/playfair/playfair-display-normal-variable-latin.woff2",
  variable: "--font-serif",
  weight: "400 700",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const geist = localFont({
  src: "../../public/fonts/geist/geist-normal-variable-latin.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

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
