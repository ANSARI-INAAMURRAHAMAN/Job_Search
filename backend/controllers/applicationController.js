import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// Post Application
export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG, JPG, or WEBP image.", 400)
    );
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    resume.tempFilePath
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;
  
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !resume
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID: req.user._id,
    employerID: jobDetails.postedBy,
    jobId,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ employerID: _id })
      .populate({
        path: "jobId",
        select: "title category"
      });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ applicantID: _id })
      .populate({
        path: "jobId",
        select: "title category"
      });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

// Get single application with applicant details (for employers)
export const getApplicationById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return next(new ErrorHandler("Application ID is required", 400));
  }

  // Check if ID is valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler("Invalid application ID format", 400));
  }

  const application = await Application.findById(id)
    .populate({
      path: "applicantID",
      select: "name email phone role createdAt"
    })
    .populate({
      path: "jobId",
      select: "title category"
    })
    .populate({
      path: "employerID",
      select: "name email"
    });

  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }

  // Check if the employer owns this job
  if (req.user.role === "Employer" && application.employerID._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to view this application", 403));
  }

  // Check if job seeker owns this application
  if (req.user.role === "Job Seeker" && application.applicantID._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to view this application", 403));
  }

  res.status(200).json({
    success: true,
    application,
  });
});

// Update application status (for employers)
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    return next(new ErrorHandler("Application ID is required", 400));
  }

  // Check if ID is valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler("Invalid application ID format", 400));
  }

  if (!status || !["Pending", "Accepted", "Rejected"].includes(status)) {
    return next(new ErrorHandler("Valid status is required (Pending, Accepted, Rejected)", 400));
  }

  const application = await Application.findById(id).populate('employerID');

  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }

  // Check if the employer owns this job
  if (req.user.role !== "Employer" || application.employerID._id.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this application", 403));
  }

  application.status = status;
  await application.save();

  res.status(200).json({
    success: true,
    message: `Application ${status.toLowerCase()} successfully`,
    application,
  });
});
