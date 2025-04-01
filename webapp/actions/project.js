"use server";

import { api } from "@/configs/fc.config";

const createProject = async (data) => {
  try {
    const { name, description, workspace } = data;
    await api.post("/projects", {
      name,
      description,
      workspace,
    });

    return { status: "success", message: "Project created successfully." };
  } catch (error) {
    console.log(error)
    return { status: "error", message: error.message };
  }
};

export { createProject };
