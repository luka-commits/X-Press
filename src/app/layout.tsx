import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// X-Press Corporate Fonts
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
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
      <body className={`${dmSans.variable} font-sans antialiased bg-xpress-bg text-xpress-text`}>
        {children}
      </body>
    </html>
  );
}
