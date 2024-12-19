import { onAuthenticatedUser } from "@/actions/user";
import UserFeed from "@/components/Stock Display/dashboard/user-feed";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

export const Home = async () => {
  const user = await onAuthenticatedUser();
  if (!user) {
    redirect("/sign-in");
  }
  try {
    return <UserFeed />;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return notFound();
  }
};

export default Home;
