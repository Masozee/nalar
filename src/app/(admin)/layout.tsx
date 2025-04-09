import React from 'react';
import { GeistSans } from 'geist/font/sans';

const geist = GeistSans;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${geist.variable} admin-layout`}>
      {children}
    </div>
  );
} 