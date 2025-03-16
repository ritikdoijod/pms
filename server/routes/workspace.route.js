import { Router } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
} from "../controllers/workspace.controller.js";

const router = Router();

router.get("/", getAllWorkspaces);
router.get("/:id", getWorkspaceById);
router.post("/", createWorkspace);
router.patch("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

export default router;
