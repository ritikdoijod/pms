import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from "@/controllers/project.controller";
import { Router } from "express";

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject)

export default router;
