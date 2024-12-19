"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { Currency, Country } from "@prisma/client";
import { Prisma } from "@prisma/client";

interface SecurityData {
  symbol: string;
  percent: number;
  shares: number;
}

export async function createBundle(formData: FormData) {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk.id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const name = formData.get("name") as string;
    const securitiesJson = formData.get("securities") as string;
    const currency = formData.get("currency") as Currency;
    const country = formData.get("country") as Country;

    if (!name || !securitiesJson || !currency || !country) {
      return { success: false, error: "Missing required fields" };
    }

    // Parse and validate securities data
    let securities: SecurityData[];
    try {
      securities = JSON.parse(securitiesJson);
      const totalPercent = securities.reduce(
        (sum, sec) => sum + sec.percent,
        0
      );
      if (totalPercent !== 100) {
        return {
          success: false,
          error: "Securities allocation must total 100%",
        };
      }
    } catch (error) {
      return { success: false, error: "Invalid securities data" };
    }

    const bundle = await prisma.bundle.create({
      data: {
        name,
        securities: securities as unknown as Prisma.InputJsonValue,
        currency,
        country,
        creatorId: user.id,
      },
      include: {
        creator: true,
      },
    });

    return { success: true, bundle };
  } catch (error) {
    console.error("Error creating bundle:", error);
    return { success: false, error: "Failed to create bundle" };
  }
}

export async function getUserBundles() {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk.id },
      include: {
        bundles: {
          include: {
            creator: {
              select: {
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, bundles: user.bundles };
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return { success: false, error: "Failed to fetch bundles" };
  }
}

export async function getBundle(bundleId: string) {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk.id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        creator: {
          select: {
            username: true,
            image: true,
          },
        },
      },
    });

    if (!bundle) {
      return { success: false, error: "Bundle not found" };
    }

    return { success: true, bundle };
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return { success: false, error: "Failed to fetch bundle" };
  }
}

export async function getCommunityBundles() {
  try {
    const clerk = await currentUser();
    if (!clerk) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerk.id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const bundles = await prisma.bundle.findMany({
      where: {
        NOT: {
          creatorId: user.id,
        },
      },
      include: {
        creator: {
          select: {
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, bundles };
  } catch (error) {
    console.error("Error fetching community bundles:", error);
    return { success: false, error: "Failed to fetch community bundles" };
  }
}
