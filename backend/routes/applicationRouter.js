import express from "express";
import {
  postApplication,
  employerGetAllApplications,
  jobseekerGetAllApplications,
  jobseekerDeleteApplication,
  getApplicationById,
  updateApplicationStatus,
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);
router.get("/:id", isAuthenticated, getApplicationById);
router.put("/status/:id", isAuthenticated, updateApplicationStatus);

export default router;
