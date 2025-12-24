import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/providers";

const rubik = Rubik({ 
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "ContractorPro - ניהול פרויקטים לקבלנים",
  description: "פלטפורמת SaaS מקיפה לקבלנים - מחשבון חכם, עורך תלת מימד, וניהול פרויקטים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className={`${rubik.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
