import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "../context/AppContext";
import { ToastProvider } from "../components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ServiceHub Cordova",
  description: "Hyperlocal service marketplace and queue management for Cordova, Cebu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
