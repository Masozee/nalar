import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | CSIS Indonesia",
  description: "Join our upcoming events or explore past discussions on Indonesia's most critical policy issues.",
  openGraph: {
    title: "Events | CSIS Indonesia",
    description: "Join our upcoming events or explore past discussions on Indonesia's most critical policy issues.",
    images: [
      {
        url: '/bg/shubham-dhage-PACWvLRNzj8-unsplash.jpg',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia Events',
      },
    ],
  },
  twitter: {
    title: "Events | CSIS Indonesia",
    description: "Join our upcoming events or explore past discussions on Indonesia's most critical policy issues.",
    images: ['/bg/shubham-dhage-PACWvLRNzj8-unsplash.jpg'],
  },
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 