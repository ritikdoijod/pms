"use server";

import { api } from "@/configs/fc.config";
import { cookies } from "next/headers";

/**
 * Register new user
 * @param {Object} values
 * @returns {Promise<Object>}
 */

const signup = async (values) => {
  try {
    const { name, email, password, confirmPassword } = values;

    const data = await api.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });

    return { status: "success", data };
  } catch (error) {
    return { status: "error", error };
  }
};

const login = async (values) => {
  try {
    const { email, password } = values;

    const data = await api.post("/auth/login", {
      email,
      password,
    });

    (await cookies()).set("token", data.token);
    (await cookies()).set("uid", data.user?._id);

    return { status: "success", data };
  } catch (error) {
    return { status: "error", error };
  }
  redir
};

const logout = async () => {
  try {
    (await cookies()).delete("token").delete("uid");
  } catch (error) {
    console.log(error);
  }
};

export { signup, login, logout };
