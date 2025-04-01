"use client";

import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  );
}

export function useAuth() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (user) {
      // ✅ Get role from Clerk's `publicMetadata`
      setRole(user.publicMetadata?.role || "teacher"); // Default to "teacher" if role is missing
    }
  }, [isSignedIn, user, router]);

  return { user, role };
}
