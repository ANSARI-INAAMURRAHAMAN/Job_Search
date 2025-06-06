import express from "express";
import dbConnection from "./database/dbConnection.js";
import userRouter from "./routes/userRouter.js";
import jobRouter from "./routes/jobRoutes.js";
import applicationRouter from "./routes/applicationRouter.js";
import authRouter from "./routes/authRoutes.js";
import userProfileRoute from "./routes/userProfileRoute.js";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import passport from "passport";

const app = express();
config({ path: "./config/config.env" });

// Initialize passport configuration
import("./config/passport.js");

// Create uploads directory if it doesn't exist (same as applications)
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create temp directory if it doesn't exist
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(passport.initialize());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use('/api/v1/auth', authRouter);

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/v1/user-profile", userProfileRoute);

dbConnection();

app.use(errorMiddleware);
export default app;
