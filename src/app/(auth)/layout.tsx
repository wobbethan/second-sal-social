import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="flex w-full items-center justify-center h-screen">
      {children}
    </div>
  );
}
