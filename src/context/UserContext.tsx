"use client";
import { onAuthenticatedUser } from "@/actions/user";
import { User } from "@/types/auth";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<{ user: User | null }>({ user: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initUser = async () => {
      const authUser = await onAuthenticatedUser();
      if (authUser?.id) {
        setUser(authUser as User);
      }
    };
    initUser();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext).user;
