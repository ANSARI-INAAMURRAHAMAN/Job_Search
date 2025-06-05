import express from "express";
import { 
  getUserProfile, 
  updateUserProfile, 
  addSkill, 
  removeSkill
} from "../controllers/userProfileController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getUserProfile);
router.route("/update").put(isAuthenticated, updateUserProfile);
router.route("/skills").post(isAuthenticated, addSkill);
router.route("/skills/:skillId").delete(isAuthenticated, removeSkill);

export default router;
