import React from "react";

// Layout for auth routes (login, signup, etc.) that should NOT have the admin sidebar.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="admin-layout font-sans">{children}</div>;
} 