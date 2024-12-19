import HomeSidebarComponent from "@/components/ui/home-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="antialiased w-full">
      <UserProvider>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden bg-gray-100 w-full">
            <div className="lg:block hidden">
              <HomeSidebarComponent />
            </div>
            <div className="w-full">{children}</div>
          </div>
        </SidebarProvider>
      </UserProvider>
    </main>
  );
}
