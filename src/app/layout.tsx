import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import SidebarComponent from "@/components/ui/home-sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Second Salary",
  description: "Social media demo for Second Salary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden bg-gray-100">
            <div className="lg:block hidden">
              <SidebarComponent />
            </div>
            <main className="flex-1 w-full">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
