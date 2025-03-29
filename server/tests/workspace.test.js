import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "@/app";
import { Workspace } from "@/models/workspace.model";

import { seedUsers, seedWorkspaces } from "./seeds/index";
import workspacesData from "./seeds/workspaces";
import { signToken } from "@/utils/jwt";

const mongoReplSet = await MongoMemoryReplSet.create({ replSet: 2 });

let ctx;
const INVALID_ID = "67d869a9de3d418067ec8f14";

beforeAll(async () => {
  await mongoose.connect(mongoReplSet.getUri());
  const [user] = await seedUsers([{ name: "Test User1", email: "test_user1@mail.com", password: "Test@123" }]);
  const workspaces = await seedWorkspaces(workspacesData, user._id);
  const token = signToken(user._id);
  const invalidToken = signToken(INVALID_ID);

  ctx = { token, user, workspaces, invalidToken };
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoReplSet.stop();
});

describe("Workspace API", () => {
  describe("GET /workspaces", () => {
    it("returns workspaces for authenticated user", async () => {
      const workspaces = await Workspace.find({ author: ctx.user._id }).lean();
      const res = await request(app)
        .get("/workspaces")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/json/);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          workspaces: workspaces.map((workspace) => ({
            _id: workspace._id.toString(),
            name: workspace.name,
            description: workspace.description,
            author: workspace.author.toString(),
          })),
        },
        meta: { apiVersion: "0.0.1" },
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .get("/workspaces")
        .set("Accept", "application/json");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      });
    });
  });

  describe("GET /workspaces/:id", () => {
    it("returns a workspace for authorized user", async () => {
      const workspace = ctx.workspaces[0];
      const res = await request(app)
        .get(`/workspaces/${workspace._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          workspace: {
            _id: workspace._id.toString(),
            name: workspace.name,
            description: workspace.description,
            author: workspace.author.toString(),
          },
        },
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .get(`/workspaces/${ctx.workspaces[0]._id}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      });
    });

    it("returns 403 for unauthorized user", async () => {
      const res = await request(app)
        .get(`/workspaces/${ctx.workspaces[0]._id}`)
        .set("Authorization", `Bearer ${ctx.invalidToken}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "FORBIDDEN",
          message: "Forbidden",
        },
      });
    });

    it("returns 404 if workspace not found", async () => {
      const res = await request(app)
        .get(`/workspaces/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Workspace not found",
        },
      });
    });
  });

  describe("POST /workspaces", () => {
    it("creates a workspace for authenticated user", async () => {
      const newWorkspace = {
        name: "New Workspace1",
        description: "This is a new workspace",
      };

      const res = await request(app)
        .post("/workspaces/")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send(newWorkspace);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          workspace: {
            name: newWorkspace.name,
            description: newWorkspace.description,
            author: ctx.user._id.toString(),
          },
        },
      });

      const workspace = await Workspace.findOne({ name: newWorkspace.name }).lean();
      expect(workspace).toMatchObject({
        name: newWorkspace.name,
        description: newWorkspace.description,
        author: ctx.user._id,
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      const res = await request(app)
        .post("/workspaces/")
        .set("Accept", "application/json")
        .send({ name: "New Workspace2", description: "" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      });
    });

    it("returns 400 for empty request body", async () => {
      const res = await request(app)
        .post("/workspaces/")
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation error occurred",
          details: [{ field: "name", message: "Required" }],
        },
      });
    });
  });

  describe("PATCH /workspaces/:id", () => {
    it("updates a workspace for authorized user", async () => {
      const workspace = ctx.workspaces[0];
      const updatedData = { name: "Updated Workspace Name" };

      const res = await request(app)
        .patch(`/workspaces/${workspace._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: {
          workspace: {
            _id: workspace._id.toString(),
            name: updatedData.name,
            description: workspace.description,
            author: workspace.author.toString(),
          },
        },
      });

      const updatedWorkspace = await Workspace.findById(workspace._id).lean();
      expect(updatedWorkspace).toMatchObject(updatedData);
    });

    it("returns 401 for unauthenticated user", async () => {
      const workspace = ctx.workspaces[0];
      const res = await request(app)
        .patch(`/workspaces/${workspace._id}`)
        .set("Accept", "application/json")
        .send({ name: "Unauthorized Update" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      });
    });

    it("returns 403 for unauthorized user", async () => {
      const workspace = ctx.workspaces[0];
      const res = await request(app)
        .patch(`/workspaces/${workspace._id}`)
        .set("Authorization", `Bearer ${ctx.invalidToken}`)
        .set("Accept", "application/json")
        .send({ name: "Unauthorized Update" });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "FORBIDDEN",
          message: "Forbidden",
        },
      });
    });

    it("returns 404 if workspace not found", async () => {
      const res = await request(app)
        .patch(`/workspaces/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json")
        .send({ name: "Nonexistent Workspace" });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Workspace not found",
        },
      });
    });
  });

  describe("DELETE /workspaces/:id", () => {
    it("deletes a workspace for authorized user", async () => {
      const workspace = ctx.workspaces[3];

      const res = await request(app)
        .delete(`/workspaces/${workspace._id}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: "success",
        data: {}
      });

      const deletedWorkspace = await Workspace.findById(workspace._id);
      expect(deletedWorkspace).toBeNull();
    });

    it("returns 401 for unauthenticated user", async () => {
      const workspace = ctx.workspaces[4];
      const res = await request(app)
        .delete(`/workspaces/${workspace._id}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      });
    });

    it("returns 403 for unauthorized user", async () => {
      const workspace = ctx.workspaces[4];
      const res = await request(app)
        .delete(`/workspaces/${workspace._id}`)
        .set("Authorization", `Bearer ${ctx.invalidToken}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "FORBIDDEN",
          message: "Forbidden",
        },
      });
    });

    it("returns 404 if workspace not found", async () => {
      const res = await request(app)
        .delete(`/workspaces/${INVALID_ID}`)
        .set("Authorization", `Bearer ${ctx.token}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Workspace not found",
        },
      });
    });
  });
});
