// Note: For dynamic metadata based on the specific publication,
// we would typically use generateMetadata function with params.
// This is a simplified version that will be enhanced in a real implementation.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publication Detail | CSIS Indonesia",
  description: "In-depth analysis and research from Indonesia's premier think tank.",
  openGraph: {
    title: "Publication Detail | CSIS Indonesia",
    description: "In-depth analysis and research from Indonesia's premier think tank.",
    images: [
      {
        url: '/bg/muska-create-5MvNlQENWDM-unsplash.png',
        width: 1200,
        height: 630,
        alt: 'CSIS Indonesia Publication',
      },
    ],
  },
  twitter: {
    title: "Publication Detail | CSIS Indonesia",
    description: "In-depth analysis and research from Indonesia's premier think tank.",
    images: ['/bg/muska-create-5MvNlQENWDM-unsplash.png'],
  },
};

export default function PublicationDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

// For a production site, you would implement dynamic metadata like this:
/*
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch publication data based on slug
  const publication = await getPublication(params.slug);
  
  // Return dynamic metadata
  return {
    title: `${publication.title} | CSIS Indonesia`,
    description: publication.excerpt,
    openGraph: {
      title: `${publication.title} | CSIS Indonesia`,
      description: publication.excerpt,
      images: [
        {
          url: publication.image,
          width: 1200,
          height: 630,
          alt: publication.title,
        },
      ],
    },
    twitter: {
      title: `${publication.title} | CSIS Indonesia`,
      description: publication.excerpt,
      images: [publication.image],
    },
  };
}
*/ 