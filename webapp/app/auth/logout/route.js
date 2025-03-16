import { logout } from "@/actions/auth";
import { redirect } from "next/navigation";

export async function GET(req) {
  await logout();

  redirect("/auth/login");
}
