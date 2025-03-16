"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/contexts/user.context";
import Link from "next/link";

const Navbar = () => {
  const { user } = useCurrentUser();

  return (
    <header className="w-full flex justify-center border-b">
      <div className="my-2 flex justify-between items-center w-full max-w-7xl">
        <h1 className="font-bold text-xl text-cyan-500">PMS</h1>
        <nav>
          <ul className="flex gap-8 text-muted-foreground">
            <li>Home</li>
            <li>Featurs</li>
            <li>Contact</li>
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {user ? (
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[1].toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Button asChild>
              <Link href="/auth/signup">Get Stated</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export { Navbar };
