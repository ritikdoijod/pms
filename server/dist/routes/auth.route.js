import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { registerUser, login } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = Router();

router.post("/register", validate({ body: registerSchema }), registerUser);
router.post("/login", validate({ body: loginSchema }), login);

export { router as default };
