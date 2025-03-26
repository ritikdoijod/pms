import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "@/app";
import { Workspace } from "@/models/workspace.model";

import { seedUsers, seedWorkspaces, seedProjects } from "./seeds/index";
import workspacesData from "./seeds/workspaces";
import projectsData from "./seeds/projects";

import { signToken } from "@/utils/jwt";

const mongoReplSet = await MongoMemoryReplSet.create({ replSet: 2 });

let ctx;

beforeAll(async () => {
  await mongoose.connect(mongoReplSet.getUri());
  const user = await seedUsers({ name: "Test User1", email: "test_user1@mail.com", password: "Test@123" });
  const workspaces = await seedWorkspaces(workspacesData, user._id)
  const projects = await seedProjects(projectsData);

  const token = signToken(user._id);
  const invalidToken = signToken("67d869a9de3d418067ec8f14")

  ctx = { token, user, workspaces, projects, invalidToken }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoReplSet.stop();
});


describe("GET /workspaces", () => {
  it("should return a list of workspaces with 200 status for authenticated user", async () => {
    const workspaces = await Workspace.find({ author: ctx.user._id }).lean();

    const res = await request(app)
      .get("/workspaces")
      .set(
        "Authorization",
        `Bearer ${ctx.token}`
      )
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toMatchObject({
      status: "success",
      data: {
        workspaces: JSON.parse(JSON.stringify(workspaces)),
      },
      meta: { apiVersion: "0.0.1" },
    });
  });

  it("should return 401 status to unauthenticated users", async () => {
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
  it("should return a workspace with 200 status for authorized user", async () => {
    const res = await request(app)
      .get(`/workspaces/${ctx.workspaces[0]._id}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      data: {
        workspace: JSON.parse(JSON.stringify(ctx.workspaces[0])),
      },
    });
  });

  it("should return 401 status to unauthenticated users", async () => {
    const res = await request(app)
      .get("/workspaces/:id")
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

  it("should return a 403 status for unauthorized user", async () => {
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

  it("should return a 404 status if workspace not found", async () => {
    const res = await request(app)
      .get("/workspaces/67d869a9de3d418067ec8f14")
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json")

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
  it("should create and return a workspace with 201 status for authenticated user", async () => {
    const res = await request(app)
      .post("/workspaces/")
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json")
      .send({
        name: "New Workspace1",
        description: "This is new workspace",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: "success",
      data: {
        workspace: {
          name: "New Workspace1",
          description: "This is new workspace",
        }
      },
    });

    const workspace = await Workspace.findOne({ name: "New Workspace1" }).lean();
    expect(workspace).toMatchObject({
      name: "New Workspace1",
      description: "This is new workspace",
      author: ctx.user._id
    })
  });

  it("should not create a workspace and return a 401 status for unauthenticated user", async () => {
    const res = await request(app)
      .post("/workspaces/")
      .set("Accept", "application/json")
      .send({
        name: "New Workspace2",
        description: "",
      });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
    });

    const workspace = await Workspace.findOne({ name: "New Workspace2" }).lean();
    expect(workspace).toBe(null)
  });

  it("should not create a workspace and return a 400 status if the request body is empty", async () => {
    const res = await request(app)
      .post("/workspaces/")
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error occured",
        details: [
          {
            field: "name",
            message: "Required",
          },
        ],
      },
    });
  });

  it("should not create a workspace and return a 400 status if name is not present in the request body", async () => {
    const res = await request(app)
      .post("/workspaces/")
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json")
      .send({
        description: "This is test workspace",
      });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error occured",
        details: [
          {
            field: "name",
            message: "Required",
          },
        ],
      },
    });

    const workspace = await Workspace.findOne({
      description: "This is test workspace",
    }).lean();
    expect(workspace).toBeNull();
  });
});

describe("PATCH /workspaces", () => {
  it("should return a updated workspace with 200 status code for a authorized user", async () => {
    const res = await request(app)
      .patch(`/workspaces/${ctx.workspaces[1]._id}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json")
      .send({
        name: "Modified Workspace1",
        description: "This workspace is modified",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      data: {
        workspace: {
          name: "Modified Workspace1",
          description: "This workspace is modified",
        },
      },
    });

    const workspace = await Workspace.findById(ctx.workspaces[1]._id).lean();
    expect(workspace).toMatchObject({
      name: "Modified Workspace1",
      description: "This workspace is modified",
    })
  });

  it("should return a 401 status for unauthenticated user", async () => {
    const res = await request(app)
      .patch(`/workspaces/${ctx.workspaces[2]._id}`)
      .set("Accept", "application/json")
      .send({
        name: "Modified Workspace2",
      });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
    });

    const workspace = await Workspace.findById(ctx.workspaces[2]._id).lean();
    expect(workspace).toMatchObject({
      name: "Workspace3",
      description: ""
    })
  });

  it("should return a 403 status for unauthorized user", async () => {
    const res = await request(app)
      .patch(`/workspaces/${ctx.workspaces[2]._id}`)
      .set("Authorization", `Bearer ${ctx.invalidToken}`)
      .set("Accept", "application/json")
      .send({
        name: "Modified Workspace3",
      });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "FORBIDDEN",
        message: "Forbidden",
      },
    });

    const workspace = await Workspace.findById(ctx.workspaces[2]._id).lean();
    expect(workspace).toMatchObject({
      name: "Workspace3",
      description: ""
    })
  });

  it("should return a 404 status if workspace not found", async () => {
    const res = await request(app)
      .patch("/workspaces/67d869a9de3d418067ec8f14")
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json")
      .send({
        name: "Modified Workspace4",
      });

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

describe("DELETE /workspaces", () => {
  it("should delete a workspace and return 200 status code for a authorized user", async () => {
    const res = await request(app)
      .delete(`/workspaces/${ctx.workspaces[3]._id}`)
      .set("Authorization", `Bearer ${ctx.token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      data: {},
    });

    const workspace = await Workspace.findById(ctx.workspaces[3]._id)
    expect(workspace).toBeNull();
  });

  it("should return a 401 status for unauthenticated user", async () => {
    const res = await request(app)
      .delete(`/workspaces/${ctx.workspaces[4]._id}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
    });

    const workspace = await Workspace.findById(ctx.workspaces[4]._id)
    expect(workspace).not.toBeNull();
  });

  it("should return a 403 status for unauthorized user", async () => {
    const res = await request(app)
      .delete(`/workspaces/${ctx.workspaces[4]._id}`)
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

    const workspace = await Workspace.findById(ctx.workspaces[4]._id)
    expect(workspace).not.toBeNull();
  });

  it("should return a 404 status if workspace not found", async () => {
    const res = await request(app)
      .delete("/workspaces/67d869a9de3d418067ec8f14")
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
