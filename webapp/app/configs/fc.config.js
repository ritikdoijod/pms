import { create } from "@/lib/fc.js";

const api = create({
  // TODO: set env for backend URL
  baseURL: 'http://localhost:8000',
  headers: {
    "Content-type": "application/json",
  },
});

api.hooks.req.use(async (opts) => {
  if (!opts.url.includes("auth")) {
    // const token = (await cookies()).get("token")?.value;

    // if (token)
    //   opts.headers = {
    //     ...opts.headers,
    //     authorization: `Bearer ${token}`,
    //   };
  }

  return opts;
});

api.hooks.res.use(async (res) => {
  if (res.status === "success") return res.data;

  throw new Error(res.error.message);
});

export { api };
