import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CSIS Indonesia",
  description: "Learn about CSIS Indonesia's mission, history, leadership, and impact as Indonesia's premier think tank since 1971.",
  openGraph: {
    title: "About CSIS Indonesia",
    description: "Learn about CSIS Indonesia's mission, history, leadership, and impact as Indonesia's premier think tank since 1971.",
    images: [
      {
        url: '/bg/getty-images-C3gjLSgTKNw-unsplash.jpg',
        width: 1200,
        height: 630,
        alt: 'About CSIS Indonesia',
      },
    ],
  },
  twitter: {
    title: "About CSIS Indonesia",
    description: "Learn about CSIS Indonesia's mission, history, leadership, and impact as Indonesia's premier think tank since 1971.",
    images: ['/bg/getty-images-C3gjLSgTKNw-unsplash.jpg'],
  },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 