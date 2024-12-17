import { onAuthenticatedUser } from "@/actions/user";
import { UserProvider } from "@/context/UserContext";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await onAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

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
