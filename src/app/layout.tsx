import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CloseDetailsOnOutsideClick } from "@/components/close-details-outside-click";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZihinGO Yönetim Paneli",
  description: "ZihinGO öğrenci, ödeme, program ve öğretmen takip sistemi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full antialiased">
        <CloseDetailsOnOutsideClick />
        {children}
      </body>
    </html>
  );
}
