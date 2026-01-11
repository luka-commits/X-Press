import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// GoHiLevel / SaaS Standard Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "XOS Dashboard - X-Press Operating System",
  description: "Digitale Fertigungs-Übersicht für X-Press Grafik & Druck",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
