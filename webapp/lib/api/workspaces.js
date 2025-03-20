"use server";

import { api } from "@/configs/fc.config"

const getWorkspaces = async () => {
  const { data: { workspaces }, error } = await api.get("/workspaces");

  if (error) return null;

  return workspaces;
}

const getWorkspaceWithProjects = async (id) => {
  const { data, error } = await api.get(`/workspaces/${id}?${new URLSearchParams({ include: 'projects' }).toString()}`)

  if (error) throw new Error(error.message);

  return data?.workspace;
}

export { getWorkspaces, getWorkspaceWithProjects }
