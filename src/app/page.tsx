import { useUserContext } from "@/context/UserContext";
import UserFeed from "@/components/Stock Display/dashboard/user-feed";
import { redirect } from "next/navigation";
import { onAuthenticatedUser } from "@/actions/user";

export default async function Home() {
  const user = await onAuthenticatedUser();

  if (user?.id) {
    redirect("/application");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white w-full">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to Second <span className="text-green-500">Salary</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Build and share your dividend investment bundles with a growing
          community of investors.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/sign-up"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
