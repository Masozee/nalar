import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board of Directors | CSIS Indonesia",
  description: "Meet the leadership team guiding CSIS Indonesia's strategic vision and research excellence.",
  openGraph: {
    title: "Board of Directors | CSIS Indonesia",
    description: "Meet the leadership team guiding CSIS Indonesia's strategic vision and research excellence.",
    images: [
      {
        url: '/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia Board of Directors',
      },
    ],
  },
  twitter: {
    title: "Board of Directors | CSIS Indonesia",
    description: "Meet the leadership team guiding CSIS Indonesia's strategic vision and research excellence.",
    images: ['/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg'],
  },
};

export default function BoardOfDirectorsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 