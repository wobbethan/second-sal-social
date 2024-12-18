"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { Country } from "@prisma/client";

export async function getUserPreferences() {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk.id },
      include: { preferences: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, preferences: user.preferences };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return { success: false, error: "Failed to fetch preferences" };
  }
}

export async function updateUserPreferences({ country }: { country: Country }) {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk.id },
      include: { preferences: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const updatedPreferences = await prisma.preferences.update({
      where: { userId: user.id },
      data: { country },
    });

    return { success: true, preferences: updatedPreferences };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

export const onAuthenticatedUser = async () => {
  try {
    const clerk = await currentUser();
    if (!clerk) return null;

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk.id },
      include: {
        bundles: true,
        posts: true,
      },
    });

    if (!user || !user.onboarded) return null;

    return {
      ...user,
      email: clerk.emailAddresses[0].emailAddress,
      image: clerk.imageUrl,
    };
  } catch (error) {
    return null;
  }
};

export async function createUser(formData: FormData) {
  const clerk = await currentUser();
  if (!clerk) {
    throw new Error("Not authenticated");
  }

  const firstName = clerk.firstName || formData.get("firstName") as string;
  const lastName = clerk.lastName || formData.get("lastName") as string;
  const username = formData.get("username") as string;
  const country = formData.get("country") as string;

  if (!country) {
    return { success: false, error: "Country is required" };
  }

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        clerkId: clerk.id,
        image: clerk.imageUrl,
        onboarded: true,
        preferences: {
          create: {
            country: country as Country,
          },
        },
        settings: {
          create: {},
        },
      },
      include: {
        preferences: true,
        settings: true,
      },
    });
    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}