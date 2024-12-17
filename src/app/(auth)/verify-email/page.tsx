"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const { isLoaded, signUp } = useSignUp();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!signUp?.verifications?.emailAddress?.status) {
      router.push("/sign-up");
    }
  }, [isLoaded, signUp, router]);

  if (!isLoaded) {
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Verification result:", result);

      if (result.status === "complete") {
        const onboardingData = JSON.parse(
          sessionStorage.getItem("onboardingData") || "{}"
        );

        if (
          !onboardingData.firstname ||
          !onboardingData.lastname ||
          !onboardingData.username
        ) {
          throw new Error("Missing required user data");
        }

        const formData = new FormData();
        formData.append("firstName", onboardingData.firstname);
        formData.append("lastName", onboardingData.lastname);
        formData.append("username", onboardingData.username);

        const dbResult = await createUser(formData);

        if (dbResult.success) {
          sessionStorage.removeItem("onboardingData");
          router.push("/dashboard");
        } else {
          console.error("Database error:", dbResult.error);
          throw new Error(
            dbResult.error || "Failed to create user in database"
          );
        }
      } else {
        throw new Error("Email verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to verify email. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-gray-600">
            Please enter the verification code sent to your email
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            autoComplete="off"
          />
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </div>
    </div>
  );
}
