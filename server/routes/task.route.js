import { Router } from "express";
import {
  getTask,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/controllers/task.controller.js";
import { validate } from "@/middlewares/validate.middleware";
import {
  paramsIdValidationSchema,
  taskValidationSchema,
} from "@/validations/task.validation";

const router = Router();

router.get("/", getTasks);

router.get("/:id", validate({ params: paramsIdValidationSchema }), getTask);

router.post("/", validate({ body: taskValidationSchema }), createTask);

router.patch(
  "/:id",
  validate({ params: paramsIdValidationSchema, body: taskValidationSchema.partial() }),
  updateTask
);

router.delete("/:id", validate({ params: paramsIdValidationSchema }), deleteTask);

export default router;
