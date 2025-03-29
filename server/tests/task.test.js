import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "@/app";
import { Task } from "@/models/task.model";

import { seedUsers, seedWorkspaces, seedProjects, seedTasks } from "./seeds/index";
import tasksData from "./seeds/tasks";

import { signToken } from "@/utils/jwt";

const mongoReplSet = await MongoMemoryReplSet.create({ replSet: 2 });

let ctx;
const INVALID_ID = "67d869a9de3d418067ec8f14";

beforeAll(async () => {
  await mongoose.connect(mongoReplSet.getUri());
  const [user] = await seedUsers([{ name: "Test User1", email: "test_user1@mail.com", password: "Test@123" }]);
  const [workspace] = await seedWorkspaces([{ name: "Workspace1", description: "" }], user._id);
  const [project] = await seedProjects([{ name: "Project1", description: "" }], workspace._id, user._id);
  const tasks = await seedTasks(tasksData, project._id, user._id);

  const token = signToken(user._id);
  const invalidToken = signToken(INVALID_ID);

  ctx = { token, user, workspace, project, tasks, invalidToken };
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoReplSet.stop();
});

describe("Task API", () => {
  describe("GET /tasks", () => {
    it("returns tasks for authenticated user", async () => {
      const tasks = await Task.find({ author: ctx.user._id }).lean();

      const res = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/json/);
      expect(res.body).toMatchObject({
        status: "success",
        data: { tasks: JSON.parse(JSON.stringify(tasks)) },
        meta: { apiVersion: "0.0.1" },
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .get("/tasks")
        .set("Accept", "application/json");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });
  });

  describe("GET /tasks/:id", () => {
    it("returns a task for authorized user", async () => {
      const res = await request(app)
        .get(`/tasks/${ctx.tasks[0]._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: { task: JSON.parse(JSON.stringify(ctx.tasks[0])) },
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .get(`/tasks/${ctx.tasks[0]._id}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      });
    });

    it("returns 403 for unauthorized user", async () => {
      const res = await request(app)
        .get(`/tasks/${ctx.tasks[0]._id}`)
        .set("Authorization", `Bearer ${ctx.invalidToken}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "FORBIDDEN", message: "Forbidden" },
      });
    });

    it("returns 404 if task not found", async () => {
      const res = await request(app)
        .get(`/tasks/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "NOT_FOUND", message: "Task not found" },
      });
    });
  });

  describe("POST /tasks", () => {
    it("creates a task for authenticated user", async () => {
      const newTask = { title: "New Task1", description: "This is a new task", project: ctx.project._id };

      const res = await request(app)
        .post("/tasks/")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send(newTask);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          task: {
            title: newTask.title,
            description: newTask.description,
            project: ctx.project._id.toString(),
            author: ctx.user._id.toString(),
          },
        },
      });

      const task = await Task.findOne({ title: newTask.title }).lean();
      expect(task).toMatchObject(newTask);
    });

    it("returns 400 for empty request body", async () => {
      const res = await request(app)
        .post("/tasks/")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation error occurred",
          details: [
            { field: "title", message: "Required" },
            { field: "project", message: "Required" },
          ],
        },
      });
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("updates a task for authorized user", async () => {
      const updatedData = { title: "Updated Task Title" };

      const res = await request(app)
        .patch(`/tasks/${ctx.tasks[0]._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          task: {
            _id: ctx.tasks[0]._id.toString(),
            title: updatedData.title,
            description: ctx.tasks[0].description,
          },
        },
      });

      const updatedTask = await Task.findById(ctx.tasks[0]._id).lean();
      expect(updatedTask).toMatchObject(updatedData);
    });

    it("returns 404 if task not found", async () => {
      const res = await request(app)
        .patch(`/tasks/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send({ title: "Nonexistent Task" });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "NOT_FOUND", message: "Task not found" },
      });
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("deletes a task for authorized user", async () => {
      const res = await request(app)
        .delete(`/tasks/${ctx.tasks[0]._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: {}
      });

      const deletedTask = await Task.findById(ctx.tasks[0]._id);
      expect(deletedTask).toBeNull();
    });

    it("returns 404 if task not found", async () => {
      const res = await request(app)
        .delete(`/tasks/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: { code: "NOT_FOUND", message: "Task not found" },
      });
    });
  });
});
