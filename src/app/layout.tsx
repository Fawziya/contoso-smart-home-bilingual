import "./globals.css";
import type { Metadata } from "next";
import Chat from "@/components/chat";
import Block from "@/components/block";
import Header from "@/components/header";
import { LanguageProvider } from "@/lib/language-context";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Contoso Smart Home",
  description:
    "Transform Your Home with Contoso - Smart Living for Modern Life",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Inter:wght@400;500;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-primary text-secondary-light font-inter"
            style={{ fontFamily: 'Inter, "Noto Sans SC", sans-serif' }}>
        <LanguageProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-grow">
              {children}
              <footer className="p-4 mt-4 border-t-2 text-center">
                <p className="text-gray-500 text-sm">
                  &copy;Contoso 2025
                </p>
              </footer>
            </main>
            <Suspense fallback={<div>Loading chat...</div>}>
              <Chat />
            </Suspense>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
