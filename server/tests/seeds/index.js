import mongoose from "mongoose";

const users = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Test User1",
    email: "test_user1@mail.com",
    password: "",
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Test User2",
    email: "test_user2@mail.com",
    password: "",
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Test User3",
    email: "test_user3@mail.com",
    password: "",
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Test User4",
    email: "test_user4@mail.com",
    password: "",
    isActive: true
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Test User5",
    email: "test_user5@mail.com",
    password: "",
    isActive: true
  }
]

const workspaces = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Workspace1",
    description: "",
    author: users[0]._id,
    projects: [],
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Workspace2",
    description: "",
    author: users[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Workspace3",
    description: "",
    author: users[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Workspace4",
    description: "",
    author: users[0]._id,
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Workspace5",
    description: "",
    author: users[0]._id,
  },
];

const projects = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Project1",
    description: "",
    author: users[0]._id,
    workspace: workspaces[0]._id
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Project2",
    description: "",
    author: users[0]._id,
    workspace: workspaces[0]._id
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Project3",
    description: "",
    author: users[0]._id,
    workspace: workspaces[0]._id
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Project4",
    description: "",
    author: users[0]._id,
    workspace: workspaces[0]._id
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Project5",
    description: "",
    author: users[0]._id,
    workspace: workspaces[0]._id
  },
]

const tasks = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: "Task1",
    description: "",
    project: projects[0]._id,
    status: "TODO",
    priority: "normal",
    author: users[0],
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: "Task2",
    description: "",
    project: projects[0]._id,
    status: "TODO",
    priority: "normal",
    author: users[0],
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: "Task3",
    description: "",
    project: projects[0]._id,
    status: "TODO",
    priority: "normal",
    author: users[0],
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: "Task4",
    description: "",
    project: projects[0]._id,
    status: "TODO",
    priority: "normal",
    author: users[0],
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    title: "Task5",
    description: "",
    project: projects[0]._id,
    status: "TODO",
    priority: "normal",
    author: users[0],
  },
]
