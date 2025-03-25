import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSIS Foundation | CSIS Indonesia",
  description: "Supporting independent research and policy development since 1989.",
  openGraph: {
    title: "CSIS Foundation | CSIS Indonesia",
    description: "Supporting independent research and policy development since 1989.",
    images: [
      {
        url: '/bg/planet-volumes-iPxknAs9h3Y-unsplash.jpg',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia Foundation',
      },
    ],
  },
  twitter: {
    title: "CSIS Foundation | CSIS Indonesia",
    description: "Supporting independent research and policy development since 1989.",
    images: ['/bg/planet-volumes-iPxknAs9h3Y-unsplash.jpg'],
  },
};

export default function FoundationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 