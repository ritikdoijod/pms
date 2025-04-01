"use server";

import { api } from "@/configs/fc.config";

const createWorkspace = async (values) => {
  try {
    const { name, description } = values;

    const data = await api.post("/workspaces", {
      name, description
    })

    return { status: "success", data };
  } catch (error) {
    return { status: "error", error };
  }
};

export { createWorkspace };
