import express from "express";
import {
  login,
  register,
  logout,
  getUser,
  updateUserProfile,
  getUserProfile,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getuser", isAuthenticated, getUser);
router.put("/update-profile", isAuthenticated, updateUserProfile);
router.get("/profile/:userId", isAuthenticated, getUserProfile);

export default router;