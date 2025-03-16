import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { login, registerUser } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate({ body: registerSchema }), registerUser);
router.post("/login", validate({ body: loginSchema }), login);

export default router;
