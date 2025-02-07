import { Router } from "express";
import passport from "passport";
import { config } from "../configs/app.config";
import { googleLoginCallback } from "../controllers/auth.controller";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/callback/google",
  passport.authenticate("google", {
    failureRedirect: `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
  }),
  googleLoginCallback,
);

export default router;
