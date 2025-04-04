import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "@/app";
import { Project } from "@/models/project.model";

import { seedUsers, seedWorkspaces, seedProjects } from "./seeds/index";
import projectsData from "./seeds/projects";

import { signToken } from "@/utils/jwt";

const mongoReplSet = await MongoMemoryReplSet.create({ replSet: 2 });

let ctx;
const INVALID_ID = "67d869a9de3d418067ec8f14";

beforeAll(async () => {
  await mongoose.connect(mongoReplSet.getUri());
  const [user] = await seedUsers([{ name: "Test User1", email: "test_user1@mail.com", password: "Test@123" }]);
  const [workspace] = await seedWorkspaces([{ name: "Workspace1", description: "" }], user._id);
  const projects = await seedProjects(projectsData, workspace._id, user._id);

  const token = signToken(user._id);
  const invalidToken = signToken(INVALID_ID);

  ctx = { token, user, workspace, projects, invalidToken };
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoReplSet.stop();
});

describe("Project API", () => {
  describe("GET /projects", () => {
    it("returns projects for authenticated user", async () => {
      const projects = await Project.find({ author: ctx.user._id }).lean();

      const res = await request(app)
        .get("/projects")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/json/);
      expect(res.body).toMatchObject({
        status: "success",
        data: { projects: JSON.parse(JSON.stringify(projects)) },
        meta: { apiVersion: "0.0.1" },
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .get("/projects")
        .set("Accept", "application/json");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });
  });

  describe("GET /projects/:id", () => {
    it("returns a project for authorized user", async () => {
      const res = await request(app)
        .get(`/projects/${ctx.projects[0]._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: { project: JSON.parse(JSON.stringify(ctx.projects[0])) },
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .get(`/projects/${ctx.projects[0]._id}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });

    it("returns 403 for unauthorized user", async () => {
      const res = await request(app)
        .get(`/projects/${ctx.projects[0]._id}`)
        .set("Authorization", `Bearer ${ctx.invalidToken}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "FORBIDDEN", message: "Forbidden" },
      });
    });

    it("returns 404 if project not found", async () => {
      const res = await request(app)
        .get(`/projects/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "NOT_FOUND", message: "Project not found" },
      });
    });
  });

  describe("POST /projects", () => {
    it("creates a project for authenticated user", async () => {
      const newProject = { name: "New Project1", description: "This is a new project", workspace: ctx.workspace._id };

      const res = await request(app)
        .post("/projects/")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send(newProject);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          project: {
            name: newProject.name,
            description: newProject.description,
            workspace: ctx.workspace._id.toString(),
            author: ctx.user._id.toString(),
          },
        },
      });

      const project = await Project.findOne({ name: newProject.name }).lean();
      expect(project).toMatchObject(newProject);
    });

    it("returns 400 for empty request body", async () => {
      const res = await request(app)
        .post("/projects/")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation error occurred",
          details: [
            { field: "name", message: "Required" },
            { field: "workspace", message: "Required" },
          ],
        },
      });
    });
  });

  describe("PATCH /projects/:id", () => {
    it("updates a project for authorized user", async () => {
      const updatedData = { name: "Updated Project Name" };

      const res = await request(app)
        .patch(`/projects/${ctx.projects[0]._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          project: {
            _id: ctx.projects[0]._id.toString(),
            name: updatedData.name,
            description: ctx.projects[0].description,
          },
        },
      });

      const updatedProject = await Project.findById(ctx.projects[0]._id).lean();
      expect(updatedProject).toMatchObject(updatedData);
    });

    it("returns 404 if project not found", async () => {
      const res = await request(app)
        .patch(`/projects/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send({ name: "Nonexistent Project" });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "NOT_FOUND", message: "Project not found" },
      });
    });
  });

  describe("DELETE /projects/:id", () => {
    it("deletes a project for authorized user", async () => {
      const res = await request(app)
        .delete(`/projects/${ctx.projects[0]._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: {}
      });

      const deletedProject = await Project.findById(ctx.projects[0]._id);
      expect(deletedProject).toBeNull();
    });

    it("returns 404 if project not found", async () => {
      const res = await request(app)
        .delete(`/projects/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "NOT_FOUND", message: "Project not found" },
      });
    });
  });
});
