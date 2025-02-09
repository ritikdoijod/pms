import { Router } from "express";
import { joinWorkspaceController } from "../controllers/member.controller";

const router = Router();

router.get("/invite/:code", joinWorkspaceController);

export default router;
