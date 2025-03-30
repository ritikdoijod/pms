"use server";

import { api } from "@/configs/fc.config";

const createWorkspace = async (_prevState, formData) => {
  try {
    console.log(formData);
    const { name, description } = Object.fromEntries(formData);

    await api.post("/workspaces", {
      name, description
    })

    return { status: "success", message: "Workspace created successfully." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export { createWorkspace };
