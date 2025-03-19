"use server";

import { api } from "@/configs/fc.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Register new user
 * @param {unknown} _prevState
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */

const signup = async (_prevState, formData) => {
  const { name, email, password, confirmPassword } =
    Object.fromEntries(formData);

  const { data, error } = await api.post("/auth/register", {
    name,
    email,
    password,
    confirmPassword,
  });

  if (error) return { status: "error", message: error.message };

  return { status: "success", message: "Registered successfully" };
};

const login = async (_prevState, formData) => {
  const { email, password } = Object.fromEntries(formData);

  const { data, error } = await api.post("/auth/login", {
    email,
    password,
  });

  if (error) return { status: "error", message: error.message };

  (await cookies()).set("token", data.token);
  (await cookies()).set("uid", data.user?._id);

  redirect("/");
};

const logout = async () => {
  try {
    (await cookies()).delete("token").delete("uid");
  } catch (error) {
    console.log(error);
  }
};

export { signup, login, logout };
