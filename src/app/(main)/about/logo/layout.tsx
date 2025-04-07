import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Behind the Logo | CSIS Indonesia",
  description: "The story and symbolism behind CSIS Indonesia's visual identity.",
  openGraph: {
    title: "Behind the Logo | CSIS Indonesia",
    description: "The story and symbolism behind CSIS Indonesia's visual identity.",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia Logo',
      },
    ],
  },
  twitter: {
    title: "Behind the Logo | CSIS Indonesia",
    description: "The story and symbolism behind CSIS Indonesia's visual identity.",
    images: ['/logo.png'],
  },
};

export default function LogoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 