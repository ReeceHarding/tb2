import React from "react";

// This layout is public and doesn't require authentication
export default function AIExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}