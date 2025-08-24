import express from "express";
import { processResumeWithAI } from "../controllers/resumeController.js";
import { processResumeForProfile, updateProfileWithResumeData } from "../controllers/resumeProfileController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// For job application auto-fill
router.post("/process", isAuthenticated, processResumeWithAI);

// For profile auto-fill
router.post("/process-profile", isAuthenticated, processResumeForProfile);
router.put("/update-profile", isAuthenticated, updateProfileWithResumeData);

export default router;
