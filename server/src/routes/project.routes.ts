import { Router } from "express";
import {
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/project.controller";

const router = Router();

router.post("/", createProjectController);
router.put("/:id", updateProjectController);
router.delete("/:id", deleteProjectController);

export default router;
