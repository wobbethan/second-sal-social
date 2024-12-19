"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { createUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  firstname: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastname: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
});

type FormData = z.infer<typeof schema>;

export default function SignUpForm() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    try {
      // Create the Clerk user with all required fields
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      // Store the form data in session storage for later use
      sessionStorage.setItem(
        "onboardingData",
        JSON.stringify({
          firstname: data.firstname,
          lastname: data.lastname,
          username: data.username,
        })
      );

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // If we get here without an error, redirect to verification page
      router.push("/verify-email");
    } catch (error) {
      console.error("Sign up error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="firstname">First Name</Label>
        <Input
          id="firstname"
          type="text"
          {...register("firstname")}
          placeholder="John"
        />
        {errors.firstname && (
          <p className="text-sm text-red-500">{errors.firstname.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastname">Last Name</Label>
        <Input
          id="lastname"
          type="text"
          {...register("lastname")}
          placeholder="Doe"
        />
        {errors.lastname && (
          <p className="text-sm text-red-500">{errors.lastname.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          {...register("username")}
          placeholder="johndoe"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
