import express from "express";
import authController from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateChangePassword,
} from "../middleware/authValidator.js";

const router = express.Router();

// Public auth endpoints
router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/forgot-password", validateForgotPassword, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);

// Protected endpoints (Requires JWT)
router.get("/me", protect, authController.getMe);
router.put(
  "/change-password",
  protect,
  validateChangePassword,
  authController.changePassword
);

export default router;
