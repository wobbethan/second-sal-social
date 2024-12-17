import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
};

export default function SignUpPage() {
  return (
    <div className="flex w-full min-h-screen overflow-y-auto">
      {/* Mobile and tablet logo */}
      <div className="fixed lg:hidden w-full flex items-start justify-center pt-10">
        <Image
          src="/logo.png"
          alt="Second Salary Logo"
          width={150}
          height={150}
          className="relative z-20"
        />
      </div>

      {/* Background for mobile and tablet */}
      <div className="fixed lg:hidden w-full h-full bg-gradient-to-br from-pink-100 via-white to-blue-100" />

      {/* Desktop two-panel layout */}
      <div className="container relative hidden lg:grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
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
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] items-center">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <SignUp afterSignUpUrl="/onboarding" />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Mobile and tablet form */}
      <div className="lg:hidden fixed inset-0 flex items-center justify-center min-h-screen py-16">
        <div className="w-full max-w-[350px] mx-4 mt-[150px]">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <SignUp afterSignUpUrl="/onboarding" />
          <p className="px-8 text-center text-sm text-muted-foreground mt-6">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}