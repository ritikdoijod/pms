import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { MongoMemoryReplSet } from "mongodb-memory-server"
import mongoose from "mongoose";

import { app } from "@/app";
import { config } from "@/configs/app.config";
import { Workspace } from "@/models/workspace.model";

const user1Id = new mongoose.Types.ObjectId().toString();
const user2Id = new mongoose.Types.ObjectId().toString();

const user1Token = jwt.sign({ iss: 'localhost.com', sub: user1Id, aud: '' }, config.AUTH_SECRET)
const user2Token = jwt.sign({ iss: 'localhost.com', sub: user2Id, aud: '' }, config.AUTH_SECRET)

const workspaces = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Workspace1',
    description: "",
    author: user1Id,
    projects: []
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Workspace2',
    description: "",
    author: new mongoose.Types.ObjectId().toString(),
    projects: []
  }
]

const mongoReplSet = await MongoMemoryReplSet.create({ replSet: 2 });

beforeAll(async () => {
  await mongoose.connect(mongoReplSet.getUri());

  await Workspace.create(workspaces);
})

afterAll(async () => {
  await mongoose.disconnect();
  await mongoReplSet.stop();
})


describe("GET /workspaces", () => {
  it("should return a list of workspaces with 200 status for authenticated user", async () => {
    const res = await request(app)
      .get("/workspaces")
      .set("Authorization", `Bearer ${user1Token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toMatchObject({
      status: "success",
      data: {
        // workspaces: await Workspace.find({ author: userId.toString() }).lean().toJSON()
        workspaces: [
          workspaces[0]
        ]
      },
      meta: { apiVersion: "0.0.1" }
    })
  })

  it("should return 401 status to unauthenticated users", async () => {
    const res = await request(app)
      .get("/workspaces")
      .set("Accept", "application/json");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({})
  })
})

describe("GET /workspaces/:id", () => {
  it("should return a workspace with 200 status for authorized user", async () => {
    const res = await request(app).get(`/workspaces/${workspaces[0]._id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      data: {
        workspace: workspaces[0]
      }
    })
  })

  it("should return a 403 status for unauthorized user", async () => {
    const res = await request(app).get(`/workspaces/${workspaces[0]._id}`)
      .set("Authorization", `Bearer ${user2Token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "FORBIDDEN",
        message: "Forbidden"
      }
    })
  })
})


describe("POST /workspaces/", () => {
  it("should create and return a workspace with 201 status for authenticated user", async () => {
    const workspace = {
      name: 'Workspace3',
      description: "This is test workspace",
      projects: []
    }

    const res = await request(app).post("/workspaces/")
      .set("Authorization", `Bearer ${user1Token}`)
      .set("Accept", "application/json").send(workspace);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      status: "success",
      data: { workspace },
    })
  })

  it("should not create a workspace and return a 401 status for unauthenticated user", async () => {
    const workspace = {
      name: 'Workspace4',
      description: "This is test workspace",
      projects: []
    }

    const res = await request(app).post("/workspaces/")
      .set("Accept", "application/json").send(workspace);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      status: "error",
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized"
      }
    })
  })
})
