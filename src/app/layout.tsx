import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Tricks - Complete Tasks & Unlock Real Money-Making Methods",
  description:
    "Complete simple tasks, surveys, and offers to unlock proven money-making methods. Earn gift cards, PayPal cash, and learn how to make money online. No account needed to start.",
  keywords: ["make money online", "paid tasks", "earn gift cards", "money tricks", "online surveys", "passive income", "earn PayPal cash"],
  openGraph: {
    title: "Money Tricks - Complete Tasks. Unlock Earnings.",
    description: "Do simple tasks, unlock proven money-making methods. Earn real rewards.",
    url: "https://money-tricks.vercel.app",
    siteName: "Money Tricks",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Money Tricks - Earn by Completing Tasks",
    description: "Do simple tasks, unlock money-making methods and earn real rewards.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://money-tricks.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-dark text-text font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
