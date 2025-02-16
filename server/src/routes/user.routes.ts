import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller";

const router = Router();

router.get("/", getCurrentUserController);

export default router;
