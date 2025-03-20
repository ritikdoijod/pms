import { Router } from 'express';
import { getUser, updateUser } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateUserSchema } from '../validations/user.validation.js';

const router = Router();

router.get("/:id", getUser);
router.patch("/:id", validate({ body: updateUserSchema }), updateUser);

export { router as default };
