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

// Get single application by ID with full applicant profile
export const getApplicationById = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  
  console.log("Getting application by ID:", applicationId);
  console.log("User role:", req.user.role);
  
  try {
    const application = await Application.findById(applicationId)
      .populate({
        path: 'applicantID',
        select: '-password', // Get full user profile including all fields
        model: 'User'
      })
      .populate({
        path: 'employerID',
        select: 'name email',
        model: 'User'
      });
    
    if (!application) {
      return next(new ErrorHandler("Application not found", 404));
    }
    
    // Ensure we have the job title from the application itself
    const jobTitle = application.jobTitle || 
                     application.jobInfo?.title || 
                     application.jobInfo?.jobTitle ||
                     "Job Position";
    
    const companyName = application.companyName || 
                        application.jobInfo?.companyName ||
                        application.employerID?.companyName ||
                        "Company";
    
    console.log("Application found:");
    console.log("- Job Title:", jobTitle);
    console.log("- Company:", companyName);
    console.log("- Applicant:", application.applicantID?.name);
    console.log("- Education count:", application.applicantID?.education?.length || 0);
    console.log("- Experience count:", application.applicantID?.experience?.length || 0);
    console.log("- Projects count:", application.applicantID?.projects?.length || 0);
    console.log("- Skills count:", application.applicantID?.skills?.length || 0);
    
    // Check if user is authorized to view this application
    if (req.user.role === "Employer") {
      if (application.employerID._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Not authorized to view this application", 403));
      }
    } else if (req.user.role === "Job Seeker") {
      if (application.applicantID._id.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Not authorized to view this application", 403));
      }
    }
    
    // Add job info to application object for easier access
    const enrichedApplication = {
      ...application.toObject(),
      jobTitle,
      companyName
    };
    
    res.status(200).json({
      success: true,
      application: enrichedApplication,
    });
  } catch (error) {
    console.error("Error in getApplicationById:", error);
    return next(new ErrorHandler("Failed to fetch application", 500));
  }
});

// Update application status (for employers)
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  
  console.log("Updating application:", applicationId, "to status:", status);
  console.log("User role:", req.user.role);
  
  if (req.user.role !== "Employer") {
    return next(new ErrorHandler("Only employers can update application status", 403));
  }
  
  const validStatuses = ["Pending", "Accepted", "Rejected"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }
  
  const application = await Application.findById(applicationId);
  
  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }
  
  // Check if employer owns this application
  if (application.employerID.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to update this application", 403));
  }
  
  application.status = status;
  await application.save();
  
  console.log("Application status updated successfully");
  
  res.status(200).json({
    success: true,
    message: `Application ${status.toLowerCase()} successfully`,
    application,
  });
});
