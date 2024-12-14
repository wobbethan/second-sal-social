import { onAuthenticatedUser } from "@/actions/auth/auth";
import UserFeed from "@/components/Stock Display/dashboard/user-feed";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

export const Home = async () => {

  try {
    return <UserFeed />;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return notFound();
  }
};

export default Home;
