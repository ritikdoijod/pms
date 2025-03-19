"use server";

import { api } from "@/configs/fc.config";

const createWorkspace = async (_prevState, formData) => {
  const { name, description } = Object.fromEntries(formData);
  const { data, error } = await api.post("/workspaces", {
    name, description
  })

  if (error) return { status: "error", message: error.message };

  return { status: "success", message: "Workspace created successfully." };
};

export { createWorkspace };
