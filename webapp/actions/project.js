"use server";

import { api } from "@/configs/fc.config";

const createProject = async (_prevState, formData) => {
  try {
    const { name, description, workspace } = Object.fromEntries(formData);
    console.log(formData);
    await api.post("/project", {
      name, description, workspace
    })

    return { status: "success", message: "Project created successfully." };
  } catch (error) {
    return { status: "error", message: error.message };
  }
};

export { createProject };
