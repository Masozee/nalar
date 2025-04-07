import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications | CSIS Indonesia",
  description: "Explore our research publications, policy papers, commentaries, and working papers on Indonesia's key policy issues.",
  openGraph: {
    title: "Publications | CSIS Indonesia",
    description: "Explore our research publications, policy papers, commentaries, and working papers on Indonesia's key policy issues.",
    images: [
      {
        url: '/bg/frank-mouland-e4mYPf_JUIk-unsplash.png',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia Publications',
      },
    ],
  },
  twitter: {
    title: "Publications | CSIS Indonesia",
    description: "Explore our research publications, policy papers, commentaries, and working papers on Indonesia's key policy issues.",
    images: ['/bg/frank-mouland-e4mYPf_JUIk-unsplash.png'],
  },
};

export default function PublicationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 