import express from "express";
import { processResumeWithAI } from "../controllers/resumeController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/process", isAuthenticated, processResumeWithAI);

export default router;
