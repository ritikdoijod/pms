import { Router } from "express";
import {
  changeWorkspaceMemberRoleController,
  createWorkspaceController,
  updateWorkspaceByIdController,
  deleteWorkspaceByIdController,
  getAllWorkspacesUserIsMemberController,
  getWorkspaceMembersController,
  getWorkspaceAnalyticsController,
  getWorkspaceByIdController,
} from "../controllers/workspace.controller";

const router = Router();

router.get("/", getAllWorkspacesUserIsMemberController);
router.get("/:id", getWorkspaceByIdController);
router.get("/:id/projects");
router.post("/", createWorkspaceController);
router.put("/:id", updateWorkspaceByIdController);
router.put("/:id/member/role", changeWorkspaceMemberRoleController);
router.delete("/:id", deleteWorkspaceByIdController);
router.get("/:id/members", getWorkspaceMembersController);
router.get("/:id/analytics", getWorkspaceAnalyticsController);

export default router;
