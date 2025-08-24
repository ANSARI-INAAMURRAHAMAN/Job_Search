import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { extractProfileDataFromResume } from "../services/geminiService.js";
import { User } from "../models/userSchema.js";
import Tesseract from 'tesseract.js';

export const processResumeForProfile = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Resume file required!", 400));
  }

  const { resume } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
  
  if (!allowedFormats.includes(resume.mimetype)) {
    return next(
      new ErrorHandler("Invalid file type. Please upload a PNG, JPG, or WEBP image.", 400)
    );
  }

  try {
    console.log('Processing resume image for profile...');
    
    // Extract text from image using OCR
    const { data: { text } } = await Tesseract.recognize(resume.tempFilePath, 'eng');
    
    console.log('Extracted text length:', text.length);
    
    if (!text || text.trim().length < 50) {
      return next(new ErrorHandler("Could not extract sufficient text from resume image", 400));
    }

    // Process with Gemini AI for comprehensive profile data
    const extractedData = await extractProfileDataFromResume(text);
    
    console.log('Extracted profile data:', extractedData);
    
    res.status(200).json({
      success: true,
      message: "Resume processed successfully for profile",
      data: extractedData,
      extractedText: text.substring(0, 500) + '...' // First 500 chars for debugging
    });

  } catch (error) {
    console.error('Resume profile processing error:', error);
    return next(new ErrorHandler(`Failed to process resume: ${error.message}`, 500));
  }
});

export const updateProfileWithResumeData = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { profileData, mergeOption = 'replace' } = req.body;
  
  if (!profileData) {
    return next(new ErrorHandler("Profile data is required", 400));
  }

  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Update personal information
    if (profileData.personalInfo) {
      const { personalInfo } = profileData;
      
      if (personalInfo.name && !user.name) user.name = personalInfo.name;
      if (personalInfo.email && !user.email) user.email = personalInfo.email;
      if (personalInfo.phone && !user.phone) user.phone = personalInfo.phone;
      if (personalInfo.bio) user.bio = personalInfo.bio;
      if (personalInfo.location) {
        user.location = user.location || {};
        if (personalInfo.location.city) user.location.city = personalInfo.location.city;
        if (personalInfo.location.country) user.location.country = personalInfo.location.country;
      }
    }

    // Handle experience
    if (profileData.experience && profileData.experience.length > 0) {
      if (mergeOption === 'replace') {
        user.experience = profileData.experience;
      } else {
        // Merge - add new experiences that don't already exist
        profileData.experience.forEach(newExp => {
          const exists = user.experience.some(existingExp => 
            existingExp.jobTitle === newExp.jobTitle && 
            existingExp.company === newExp.company
          );
          if (!exists) {
            user.experience.push(newExp);
          }
        });
      }
    }

    // Handle education
    if (profileData.education && profileData.education.length > 0) {
      if (mergeOption === 'replace') {
        user.education = profileData.education;
      } else {
        profileData.education.forEach(newEdu => {
          const exists = user.education.some(existingEdu => 
            existingEdu.degree === newEdu.degree && 
            existingEdu.institution === newEdu.institution
          );
          if (!exists) {
            user.education.push(newEdu);
          }
        });
      }
    }

    // Handle projects
    if (profileData.projects && profileData.projects.length > 0) {
      if (mergeOption === 'replace') {
        user.projects = profileData.projects;
      } else {
        profileData.projects.forEach(newProject => {
          const exists = user.projects.some(existingProject => 
            existingProject.title === newProject.title
          );
          if (!exists) {
            user.projects.push(newProject);
          }
        });
      }
    }

    // Handle skills
    if (profileData.skills && profileData.skills.length > 0) {
      if (mergeOption === 'replace') {
        user.skills = profileData.skills;
      } else {
        profileData.skills.forEach(newSkill => {
          const exists = user.skills.some(existingSkill => 
            existingSkill.name.toLowerCase() === newSkill.name.toLowerCase()
          );
          if (!exists) {
            user.skills.push(newSkill);
          }
        });
      }
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully with resume data",
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return next(new ErrorHandler(`Failed to update profile: ${error.message}`, 500));
  }
});
