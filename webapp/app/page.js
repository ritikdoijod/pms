"use client";

import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/lib/contexts/user.context";
import { BadgeCheck, BellElectric, Bean, Bomb } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user } = useCurrentUser();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      {user ? (
        <div className="flex-1 flex flex-col justify-center items-center">
          <h1 className="text-6xl font-black">
            Welcome
            <span className="ms-8 text-cyan-500">{user.name}</span>
          </h1>
          <Button className="mt-20 w-fit" asChild>
            <Link href={`/workspace/${user.currentWorkspace}`}>
              Go to workspace
            </Link>
          </Button>
        </div>
      ) : (
        <div className="w-7xl self-center flex flex-col h-full">
          <div className="w-3xl self-center text-center my-48">
            <div className="">
              <h1 className="text-6xl font-black">
                Your Space.
                <span className="text-cyan-500">Your Flow.</span>
              </h1>
              <p className="mt-8 text-muted-foreground">
                Gather your projects, tasks, and ideas in a place that feels
                like home. Focus finds you. Achievements unfold. Made for you,
                by
                <span className="text-accent">_</span>.
              </p>
            </div>
            <div className="mt-12 space-x-4">
              <Button>Start for free</Button>
              <Button variant="ghost">Watch demo</Button>
            </div>
          </div>

          <div className="">
            <h2 className="text-xl font-bold text-center">
              Crafted for Your Best Work
            </h2>
            <p className="text-center mt-4">
              Your personal command center comes alive with tools that simplify,
              inspire, and empower. Here’s how it works for you.
            </p>
            <div className="mt-16 flex justify-center flex-wrap gap-12">
              <Card className="w-sm bg-secondary/50 shadow-none border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 text-cyan-500 bg-background/50 w-fit rounded-sm">
                      <BadgeCheck />
                    </div>
                    One Home for Everything
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Projects, tasks, and ideas—all in a single, beautifully simple
                  view. No more chaos. Just clarity, at your fingertips.
                </CardContent>
              </Card>
              <Card className="w-sm bg-secondary/50 shadow-none border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 text-cyan-500 bg-background/50 w-fit rounded-sm">
                      <BellElectric />
                    </div>
                    Focus That Finds You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Distractions fade. Smart layouts and gentle nudges keep you in
                  the zone, so your next step is always clear.
                </CardContent>
              </Card>
              <Card className="w-sm bg-secondary/50 shadow-none border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 text-cyan-500 bg-background/50 w-fit rounded-sm">
                      <Bean />
                    </div>
                    Made for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Customize it your way—colors, layouts, workflows. It’s your
                  space, designed to feel like home, powered by Apple precision.
                </CardContent>
              </Card>
              <Card className="w-sm bg-secondary/50 shadow-none border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <div className="p-3 text-cyan-500 bg-background/50 w-fit rounded-sm">
                      <Bomb />
                    </div>
                    Achievements, Unfolded
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  Watch your goals take shape with elegant progress tracking.
                  From small wins to big milestones, every moment counts.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
