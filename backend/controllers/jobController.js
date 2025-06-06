import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Job } from "../models/jobSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
});

export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    requiredSkills,
    jobRole,
    isRemote,
    applicationDeadline,
  } = req.body;

  if (
    !title ||
    !description ||
    !category ||
    !country ||
    !city ||
    !location ||
    !jobRole ||
    !applicationDeadline
  ) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler(
        "Please either provide fixed salary or ranged salary.",
        400
      )
    );
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler("Cannot Enter Fixed and Ranged Salary together.", 400)
    );
  }

  if (!requiredSkills || requiredSkills.length === 0) {
    return next(
      new ErrorHandler("Please provide at least one required skill.", 400)
    );
  }

  const postedBy = req.user._id;
  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    postedBy,
    requiredSkills: Array.isArray(requiredSkills)
      ? requiredSkills
      : [requiredSkills],
    jobRole,
    isRemote: isRemote === true || isRemote === "true",
    applicationDeadline: new Date(applicationDeadline),
    jobPostedOn: new Date(),
  });

  res.status(200).json({
    success: true,
    message: "Job Posted Successfully!",
    job,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

export const updateJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  
  const { id } = req.params;
  let job = await Job.findById(id);
  
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }

  // Check if the user is the owner of the job
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("You are not authorized to update this job.", 403)
    );
  }
  
  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    requiredSkills,
    jobRole,
    isRemote,
    applicationDeadline
  } = req.body;

  // Validate required skills
  if (requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length === 0) {
    return next(new ErrorHandler("Please provide at least one required skill.", 400));
  }

  // Prepare update data
  const updateData = {};
  
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (category) updateData.category = category;
  if (country) updateData.country = country;
  if (city) updateData.city = city;
  if (location) updateData.location = location;
  if (fixedSalary) updateData.fixedSalary = fixedSalary;
  if (salaryFrom) updateData.salaryFrom = salaryFrom;
  if (salaryTo) updateData.salaryTo = salaryTo;
  if (requiredSkills) updateData.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills];
  if (jobRole) updateData.jobRole = jobRole;
  if (typeof isRemote !== 'undefined') updateData.isRemote = isRemote === true || isRemote === "true";
  if (applicationDeadline) updateData.applicationDeadline = new Date(applicationDeadline);

  job = await Job.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Job Updated Successfully!",
    job
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted!",
  });
});

export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return next(new ErrorHandler(`Invalid ID / CastError`, 404));
  }
});
