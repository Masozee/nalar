import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our History | CSIS Indonesia",
  description: "Explore the history and evolution of CSIS Indonesia since its founding in 1971.",
  openGraph: {
    title: "Our History | CSIS Indonesia",
    description: "Explore the history and evolution of CSIS Indonesia since its founding in 1971.",
    images: [
      {
        url: '/bg/boston-public-library-4yPHCb1SPR4-unsplash.jpg',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia History',
      },
    ],
  },
  twitter: {
    title: "Our History | CSIS Indonesia",
    description: "Explore the history and evolution of CSIS Indonesia since its founding in 1971.",
    images: ['/bg/boston-public-library-4yPHCb1SPR4-unsplash.jpg'],
  },
};

export default function HistoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 