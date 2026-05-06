"use client";

import { useEffect, useState } from "react";

import { currentUser } from "@/lib/current-user";
import { getAuthUser } from "@/lib/auth";

export function useCurrentUser() {
  const [user, setUser] = useState(currentUser);

  useEffect(() => {
    const authUser = getAuthUser();

    if (authUser) {
      setUser(authUser);
    }
  }, []);

  return user;
}
