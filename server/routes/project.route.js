import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "@/controllers/project.controller";
import { validate } from "@/middlewares/validate.middleware";
import { objectIdValidationSchema } from "@/validations/mongoose.validation";
import { projectValidationSchema } from "@/validations/project.validation";
import { Router } from "express";

const router = Router();

router.get("/", getProjects);

router.get(
  "/:id",
  validate({ params: objectIdValidationSchema("Invalid project id") }),
  getProject
);

router.post("/", validate({ body: projectValidationSchema }), createProject);

router.patch(
  "/:id",
  validate({
    params: objectIdValidationSchema("Invalid project id"),
    body: projectValidationSchema.partial(),
  }),
  updateProject
);

router.delete(
  "/:id",
  validate({ params: objectIdValidationSchema("Invalid project id") }),
  deleteProject
);

export default router;
