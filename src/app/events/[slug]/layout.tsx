import type { Metadata } from "next";

// Note: For a production site, we would implement dynamic metadata with generateMetadata
export const metadata: Metadata = {
  title: "Event Detail | CSIS Indonesia",
  description: "Detailed information about CSIS Indonesia's events, including speakers, presentations, and resources.",
  openGraph: {
    title: "Event Detail | CSIS Indonesia",
    description: "Detailed information about CSIS Indonesia's events, including speakers, presentations, and resources.",
    images: [
      {
        url: '/bg/getty-images-AoJ2_pyNoYc-unsplash.jpg',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia Event',
      },
    ],
  },
  twitter: {
    title: "Event Detail | CSIS Indonesia",
    description: "Detailed information about CSIS Indonesia's events, including speakers, presentations, and resources.",
    images: ['/bg/getty-images-AoJ2_pyNoYc-unsplash.jpg'],
  },
};

export default function EventDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 