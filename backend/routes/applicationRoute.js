import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { postApplication, getApplications, updateApplicationStatus } from "../controllers/applicationController.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Apply for a job
router.post("/post/:id", isAuthenticated, upload.single("resume"), postApplication);

// Get all applications of a user
router.get("/me", isAuthenticated, getApplications);

// Update application status (admin)
router.put("/status/:id", isAuthenticated, updateApplicationStatus);

export default router;