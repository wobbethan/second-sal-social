import { onAuthenticatedUser } from "@/actions/user";
import { UserProvider } from "@/context/UserContext";
import { redirect } from "next/navigation";

export default function BundleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen overflow-y-auto pb-8">{children}</div>;
}
