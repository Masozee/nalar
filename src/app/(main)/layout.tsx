import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import AnimationProvider from "@/providers/AnimationProvider";
import ScrollProgress from "@/components/animations/ScrollProgress";
import NavBar from "@/components/NavBar";
import BackToTop from "@/components/BackToTop";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import FeedbackPopup from '@/components/FeedbackPopup';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "CSIS Indonesia | Centre for Strategic and International Studies",
  description: "Indonesia's premier think tank for economics, international relations, and politics",
  keywords: "CSIS, Indonesia, think tank, economics, international relations, politics, research",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL('https://beta.csis.or.id'), // Replace with your actual domain
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://beta.csis.or.id',
    siteName: 'CSIS Indonesia',
    title: 'CSIS Indonesia | Centre for Strategic and International Studies',
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
    title: 'CSIS Indonesia | Centre for Strategic and International Studies',
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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <NavBar />
        <ScrollProgress />
        <AnimationProvider>
          {children}
        </AnimationProvider>
        <SpeedInsights />
        <Analytics />
        <BackToTop />
        <div id="accessibility">
          <AccessibilityWidget />
        </div>
        <FeedbackPopup />
      </body>
    </html>
  );
}
