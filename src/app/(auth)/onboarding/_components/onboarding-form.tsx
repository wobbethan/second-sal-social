"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  country: z.string().min(1, {
    message: "Please select your country.",
  }),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("username", data.username);
      formData.append("country", data.country);

      const result = await createUser(formData);

      if (result.success) {
        router.push("/application");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Onboarding submission error:", error);
      alert("Failed to submit onboarding data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          {...register("firstName")}
          placeholder="John"
        />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          type="text"
          {...register("lastName")}
          placeholder="Doe"
        />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName.message}</p>
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
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select onValueChange={(value) => setValue("country", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-sm text-red-500">{errors.country.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Complete Onboarding"}
      </Button>
    </form>
  );
}
