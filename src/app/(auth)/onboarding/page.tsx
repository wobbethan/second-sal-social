import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import OnboardingForm from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-up");
  }

  return (
    <div className="flex w-full h-screen">
      <div className="absolute lg:hidden w-full flex items-start justify-center pt-10">
        <Image
          src="/logo.png"
          alt="Second Salary Logo"
          width={150}
          height={150}
          className="relative z-20"
        />
      </div>
      <div className="absolute lg:hidden w-full h-full bg-gradient-to-br from-pink-100 via-white to-blue-100" />
      <div className="container relative hidden lg:grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-gradient-to-br from-pink-100 via-white to-blue-100 p-10 text-zinc-900 dark:border-r lg:flex">
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src="/logo.png"
              alt="Second Salary Logo"
              width={200}
              height={200}
              className="mr-2"
            />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Empowering Your Investment Journey, One Bundle at a
                Time.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8 flex items-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Complete Your Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your details to finish setting up your account
              </p>
            </div>
            <OnboardingForm />
          </div>
        </div>
      </div>
      <div className="lg:hidden absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[350px] mx-4 mt-[150px]">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to finish setting up your account
            </p>
          </div>
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
