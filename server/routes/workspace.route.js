import { Router } from "express";
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
} from "@/controllers/workspace.controller.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { paramsIdValidationSchema, workspaceValidationSchema } from "@/validations/workspace.validation.js";

const router = Router();

router.get("/", getAllWorkspaces);

router.get(
  "/:id",
  validate({ params: paramsIdValidationSchema }),
  getWorkspaceById
);

router.post(
  "/",
  validate({ body: workspaceValidationSchema }),
  createWorkspace
);

router.patch(
  "/:id",
  validate({
    params: paramsIdValidationSchema,
    body: workspaceValidationSchema.partial(),
  }),
  updateWorkspace
);

router.delete(
  "/:id",
  validate({ params: paramsIdValidationSchema }),
  deleteWorkspace
);

export default router;
