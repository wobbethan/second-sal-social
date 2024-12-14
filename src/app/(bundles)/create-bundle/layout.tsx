import { UserProvider } from "@/context/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="antialiased w-full">
      <UserProvider>
        <div className="flex h-screen overflow-hidden bg-gray-100 w-full">
          <div className="w-full overflow-y-auto">{children}</div>
        </div>
      </UserProvider>
    </main>
  );
}
