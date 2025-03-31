"use server";

import { api } from "@/configs/fc.config";

const createWorkspace = async (data) => {
  try {
    const { name, description } = data;

    await api.post("/workspaces", {
      name, description
    })

    return { status: "success", message: "Workspace created successfully." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export { createWorkspace };
