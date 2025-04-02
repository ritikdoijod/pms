import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const auth = async (req) => {
  const token = (await cookies()).get("token");
  const uid = (await cookies()).get("uid");

  if (!token || !uid)
    return NextResponse.redirect(new URL("/auth/login", req.url));

  return NextResponse.next();
};

export { auth as middleware };

export const config = {
  matcher: ["/workspace/:path*"],
};
