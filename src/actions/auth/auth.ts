"use server";

import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticatedUser = async () => {
  try {
    const clerk = await currentUser();
    if (!clerk) return { status: 404 };

    return {
      id: clerk.id,
      email: clerk.emailAddresses[0].emailAddress,
      firstName: clerk.firstName,
      lastName: clerk.lastName,
      image: clerk.imageUrl,
      role: clerk.privateMetadata.role,
    };
  } catch (error) {
    return {
      status: 400,
    };
  }
};
