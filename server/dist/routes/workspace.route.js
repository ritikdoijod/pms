import { Router } from 'express';
import { getAllWorkspaces, getWorkspaceById, createWorkspace, updateWorkspace, deleteWorkspace } from '../controllers/workspace.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdValidationSchema } from '../validations/mongoose.validation.js';
import { workspaceValidationSchema } from '../validations/workspace.validation.js';

const router = Router();

router.get("/", getAllWorkspaces);

router.get(
  "/:id",
  validate({ params: objectIdValidationSchema("Invalid Workspace Id") }),
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
    params: objectIdValidationSchema("Invalid Workspace Id"),
    body: workspaceValidationSchema.partial(),
  }),
  updateWorkspace
);

router.delete(
  "/:id",
  validate({ params: objectIdValidationSchema("Invalid Workspace Id") }),
  deleteWorkspace
);

export { router as default };
