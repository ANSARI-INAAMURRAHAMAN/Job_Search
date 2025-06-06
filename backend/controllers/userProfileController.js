import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// Get user profile
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  
  const user = await User.findById(userId).select('-password');
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  res.status(200).json({
    success: true,
    user
  });
});

// Update user profile
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  
  console.log("Update Profile Request Body:", req.body);
  
  const updateData = { ...req.body };
  
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  console.log("Updated User:", user);
  
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// Add skill (individual skill add)
export const addSkill = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { name, level, category } = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  // Check if skill already exists
  const existingSkill = user.skills.find(skill => skill.name.toLowerCase() === name.toLowerCase());
  
  if (existingSkill) {
    return next(new ErrorHandler("Skill already exists", 400));
  }
  
  user.skills.push({ name, level, category });
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Skill added successfully",
    skills: user.skills
  });
});

// Remove skill (individual skill remove)
export const removeSkill = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { skillId } = req.params;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  user.skills = user.skills.filter(skill => skill._id.toString() !== skillId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Skill removed successfully",
    skills: user.skills
  });
});

// Add education (individual education add)
export const addEducation = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const educationData = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  user.education.push(educationData);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Education added successfully",
    education: user.education
  });
});

// Add experience (individual experience add)
export const addExperience = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const experienceData = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  user.experience.push(experienceData);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Experience added successfully",
    experience: user.experience
  });
});

// Add project (individual project add)
export const addProject = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const projectData = req.body;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  user.projects.push(projectData);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Project added successfully",
    projects: user.projects
  });
});

// Remove education (individual education remove)
export const removeEducation = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { educationId } = req.params;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  user.education = user.education.filter(edu => edu._id.toString() !== educationId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Education removed successfully",
    education: user.education
  });
});

// Remove experience (individual experience remove)
export const removeExperience = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { experienceId } = req.params;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  user.experience = user.experience.filter(exp => exp._id.toString() !== experienceId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Experience removed successfully",
    experience: user.experience
  });
});

// Remove project (individual project remove)
export const removeProject = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  
  const user = await User.findById(userId);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  user.projects = user.projects.filter(project => project._id.toString() !== projectId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Project removed successfully",
    projects: user.projects
  });
});
