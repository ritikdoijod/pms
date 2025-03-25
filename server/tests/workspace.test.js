import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "@/app";
import { config } from "@/configs/app.config";
import { seedUsers, seedWorkspaces } from "./seeds/index";

import usersData from "./seeds/users";
import workspacesData from "./seeds/workspaces";
import { Workspace } from "@/models/workspace.model";

const user1Id = new mongoose.Types.ObjectId().toString();
const user2Id = new mongoose.Types.ObjectId().toString();

const user1Token = jwt.sign(
  { iss: "localhost.com", sub: user1Id, aud: "" },
  config.AUTH_SECRET
);
const user2Token = jwt.sign(
  { iss: "localhost.com", sub: user2Id, aud: "" },
  config.AUTH_SECRET
);

const mongoReplSet = await MongoMemoryReplSet.create({ replSet: 2 });

let users, workspaces;

beforeAll(async () => {
  await mongoose.connect(mongoReplSet.getUri());
  users = await seedUsers(usersData);
  workspaces = (await seedWorkspaces(workspacesData, users[0]._id)).map(
    (workspace) => ({})
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoReplSet.stop();
});

describe("GET /workspaces", () => {
  it("should return a list of workspaces with 200 status for authenticated user", async () => {
    const workspaces = (
      await Workspace.find({ author: users[0]._id }).lean()
    ).map((workspace) => ({
      ...workspace,
      
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),

    }));

    console.log(workspaces);

    const res = await request(app)
      .get("/workspaces")
      .set(
        "Authorization",
        `Bearer ${jwt.sign(
          { iss: "localhost.com", sub: users[0]._id, aud: "" },
          config.AUTH_SECRET
        )}`
      )
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toMatchObject({
      status: "success",
      data: {
        workspaces,
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

// describe("GET /workspaces/:id", () => {
//   it("should return a workspace with 200 status for authorized user", async () => {
//     const res = await request(app)
//       .get(`/workspaces/${workspaces[0]._id}`)
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json");

//     expect(res.status).toBe(200);
//     expect(res.body).toMatchObject({
//       status: "success",
//       data: {
//         workspace: workspaces[0],
//       },
//     });
//   });

//   it("should return a 403 status for unauthorized user", async () => {
//     const res = await request(app)
//       .get(`/workspaces/${workspaces[0]._id}`)
//       .set("Authorization", `Bearer ${user2Token}`)
//       .set("Accept", "application/json");

//     expect(res.status).toBe(403);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "FORBIDDEN",
//         message: "Forbidden",
//       },
//     });
//   });
// });

// describe("POST /workspaces", () => {
//   it("should create and return a workspace with 201 status for authenticated user", async () => {
//     const workspace = {
//       name: "Workspace3",
//       description: "This is test workspace",
//       projects: [],
//     };

//     const res = await request(app)
//       .post("/workspaces/")
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json")
//       .send(workspace);

//     expect(res.status).toBe(201);
//     expect(res.body).toMatchObject({
//       status: "success",
//       data: { workspace },
//     });
//   });

//   it("should not create a workspace and return a 401 status for unauthenticated user", async () => {
//     const workspace = {
//       name: "Workspace4",
//       description: "This is test workspace",
//       projects: [],
//     };

//     const res = await request(app)
//       .post("/workspaces/")
//       .set("Accept", "application/json")
//       .send(workspace);

//     expect(res.status).toBe(401);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "UNAUTHORIZED",
//         message: "Unauthorized",
//       },
//     });
//   });

//   it("should not create a workspace and return a 400 status if the request body is empty", async () => {
//     const res = await request(app)
//       .post("/workspaces/")
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json");

//     expect(res.status).toBe(400);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "VALIDATION_ERROR",
//         message: "Validation error occured",
//         details: [
//           {
//             field: "name",
//             message: "Required",
//           },
//         ],
//       },
//     });
//   });

//   it("should not create a workspace and return a 400 status if name is not present in the request body", async () => {
//     const workspace = {
//       description: "This is test workspace",
//       projects: [],
//     };

//     const res = await request(app)
//       .post("/workspaces/")
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json")
//       .send(workspace);

//     expect(res.status).toBe(400);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "VALIDATION_ERROR",
//         message: "Validation error occured",
//         details: [
//           {
//             field: "name",
//             message: "Required",
//           },
//         ],
//       },
//     });
//   });
// });

// describe("PATCH /workspaces", () => {
//   it("should return a updated workspace with 200 status code for a authorized user", async () => {
//     const res = await request(app)
//       .patch(`/workspaces/${workspaces[0]._id}`)
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json")
//       .send({
//         name: "Workspace5",
//       });

//     expect(res.status).toBe(200);
//     expect(res.body).toMatchObject({
//       status: "success",
//       data: {
//         workspace: {
//           ...workspaces[0],
//           name: "Workspace5",
//         },
//       },
//     });
//   });

//   it("should return a 401 status for unauthenticated user", async () => {
//     const res = await request(app)
//       .patch(`/workspaces/${workspaces[0]._id}`)
//       .set("Accept", "application/json")
//       .send({
//         name: "Workspace6",
//       });

//     expect(res.status).toBe(401);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "UNAUTHORIZED",
//         message: "Unauthorized",
//       },
//     });
//   });

//   it("should return a 403 status for unauthorized user", async () => {
//     const res = await request(app)
//       .patch(`/workspaces/${workspaces[0]._id}`)
//       .set("Authorization", `Bearer ${user2Token}`)
//       .set("Accept", "application/json")
//       .send({
//         name: "Workspace6",
//       });

//     expect(res.status).toBe(403);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "FORBIDDEN",
//         message: "Forbidden",
//       },
//     });
//   });

//   it("should return a 404 status if workspace not found", async () => {
//     const res = await request(app)
//       .patch(`/workspaces/${new mongoose.Types.ObjectId().toString()}`)
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json")
//       .send({
//         name: "Workspace7",
//       });

//     expect(res.status).toBe(404);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "NOT_FOUND",
//         message: "Workspace not found",
//       },
//     });
//   });
// });

// describe("DELETE /workspaces", () => {
//   it("should delete a workspace and return 200 status code for a authorized user", async () => {
//     const res = await request(app)
//       .delete(`/workspaces/${workspaces[0]._id}`)
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json");

//     expect(res.status).toBe(200);
//     expect(res.body).toMatchObject({
//       status: "success",
//       data: {},
//     });
//   });

//   it("should return a 401 status for unauthenticated user", async () => {
//     const res = await request(app)
//       .delete(`/workspaces/${workspaces[0]._id}`)
//       .set("Accept", "application/json");

//     expect(res.status).toBe(401);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "UNAUTHORIZED",
//         message: "Unauthorized",
//       },
//     });
//   });

//   it("should return a 403 status for unauthorized user", async () => {
//     const res = await request(app)
//       .delete(`/workspaces/${workspaces[1]._id}`)
//       .set("Authorization", `Bearer ${user2Token}`)
//       .set("Accept", "application/json");

//     expect(res.status).toBe(403);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "FORBIDDEN",
//         message: "Forbidden",
//       },
//     });
//   });

//   it("should return a 404 status if workspace not found", async () => {
//     const res = await request(app)
//       .patch(`/workspaces/${new mongoose.Types.ObjectId().toString()}`)
//       .set("Authorization", `Bearer ${user1Token}`)
//       .set("Accept", "application/json");

//     expect(res.status).toBe(404);
//     expect(res.body).toMatchObject({
//       status: "error",
//       error: {
//         code: "NOT_FOUND",
//         message: "Workspace not found",
//       },
//     });
//   });
// });
