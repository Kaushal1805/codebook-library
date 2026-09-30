import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeBook Library — Read. Learn. Prepare. Get Hired.",
  description:
    "Practical books, interview questions, and technical resources for developers and aspiring tech professionals.",
  keywords: [
    "programming books",
    "coding interview",
    "technical interview preparation",
    "SQL",
    "Python",
    "machine learning",
    "data science",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-dvh flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
