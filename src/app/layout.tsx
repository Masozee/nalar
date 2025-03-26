import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import AnimationProvider from "@/providers/AnimationProvider";
import ScrollProgress from "@/components/animations/ScrollProgress";
import NavBar from "@/components/NavBar";
import BackToTop from "@/components/BackToTop";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CSIS Indonesia | Center for Strategic and International Studies",
  description: "Indonesia's premier think tank for economics, international relations, and politics",
  keywords: "CSIS, Indonesia, think tank, economics, international relations, politics, research",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL('https://csis-indonesia.vercel.app'), // Replace with your actual domain
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://csis-indonesia.vercel.app',
    siteName: 'CSIS Indonesia',
    title: 'CSIS Indonesia | Center for Strategic and International Studies',
    description: "Indonesia's premier think tank for economics, international relations, and politics",
    images: [
      {
        url: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSIS Indonesia | Center for Strategic and International Studies',
    description: "Indonesia's premier think tank for economics, international relations, and politics",
    images: ['/bg/muska-create-5MvNlQENWDM-unsplash.png'],
    creator: '@CSISIndonesia',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={playfair.className}>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <NavBar />
        <ScrollProgress />
        <AnimationProvider>
          {children}
        </AnimationProvider>
        <SpeedInsights />
        <Analytics />
        <BackToTop />
      </body>
    </html>
  );
}
