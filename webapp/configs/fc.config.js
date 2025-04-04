import { create } from "@/lib/fc.js";
import { cookies } from "next/headers";

const api = create({
  baseURL: process.env.BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
});

api.hooks.req.use(async (opts) => {
  if (!opts.url.includes("auth")) {
    const token = (await cookies()).get("token")?.value;

    if (token)
      opts.headers = {
        ...opts.headers,
        authorization: `Bearer ${token}`,
      };
  }

  return opts;
});

api.hooks.res.use(async (res) => {
  if (res.status === "success") return res.data;

  console.log(res.error)
  throw new Error(res.error.message);
});

export { api };
