import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from '@/components/Header'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Product Careers",
  description: "Curated product management job board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased bg-gray-50`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
