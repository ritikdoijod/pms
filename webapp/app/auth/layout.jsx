"use client";

import * as React from "react";
import { Link } from "@/components/ui/link";
import { useCurrentUser } from "@/lib/contexts/user.context";
import { useRouter } from "next/navigation";

const AuthLayout = ({ children }) => {
  const { user } = useCurrentUser();
  const router = useRouter();

  React.useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {children}
        <div className="self-center max-w-xs text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/terms">Terms of service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
