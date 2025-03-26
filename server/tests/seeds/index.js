import { Project } from "@/models/project.model";
import { Task } from "@/models/task.model";
import { User } from "@/models/user.model";
import { Workspace } from "@/models/workspace.model";

const seedUsers = async (users) => {
  return await User.create(users);
};

const seedWorkspaces = async (workspaces, author) => {
  const workspacesWithAuthor = workspaces.map((workspace) => ({
    ...workspace,
    author,
  }));

  return await Workspace.create(workspacesWithAuthor);
};

const seedProjects = async (projects, workspace, author) => {
  const projectsWithWorkspaceAndAuthor = projects.map((project) => ({
    ...project,
    workspace,
    author,
  }));

  return await Project.create(projectsWithWorkspaceAndAuthor);
};

const seedTasks = async (tasks, project, author) => {
  const tasksWithProjectAndAuthor = tasks.map((task) => ({
    ...task,
    project,
    author,
  }));
  return await Task.create(tasksWithProjectAndAuthor);
};

export { seedUsers, seedWorkspaces, seedProjects, seedTasks };
