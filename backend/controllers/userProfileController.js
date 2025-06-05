import { UserProfile } from "../models/userProfile.js";
import fs from "fs";
import path from "path";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let profile = await UserProfile.findOne({ userId }).populate('userId', 'name email');
    
    if (!profile) {
      profile = new UserProfile({
        userId,
        bio: "",
        skills: [],
        experience: [],
        education: [],
        projects: []
      });
      await profile.save();
      await profile.populate('userId', 'name email');
    }
    
    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.log("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const userId = req.user._id;
    
    const profileData = {
      bio: req.body.bio || "",
      phone: req.body.phone || "",
      address: req.body.address || {},
      education: req.body.education || [],
      skills: req.body.skills || [],
      experience: req.body.experience || [],
      projects: req.body.projects || []
    };
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    ).populate('userId', 'name email');
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile
    });
    
  } catch (error) {
    console.log("Update Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

// Add skill
export const addSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, proficiency } = req.body;
    
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ userId, skills: [] });
    }
    
    // Check if skill already exists
    const existingSkill = profile.skills.find(skill => skill.name.toLowerCase() === name.toLowerCase());
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists"
      });
    }
    
    profile.skills.push({ name, proficiency });
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: "Skill added successfully",
      skills: profile.skills
    });
  } catch (error) {
    console.log("Add Skill Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

// Remove skill
export const removeSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skillId } = req.params;
    
    const profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    
    profile.skills = profile.skills.filter(skill => skill._id.toString() !== skillId);
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: "Skill removed successfully",
      skills: profile.skills
    });
  } catch (error) {
    console.log("Remove Skill Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

// Add education
export const addEducation = async (req, res) => {
  try {
    const userId = req.user._id;
    const educationData = req.body;
    
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ userId, education: [] });
    }
    
    profile.education.push(educationData);
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: "Education added successfully",
      education: profile.education
    });
  } catch (error) {
    console.log("Add Education Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

// Add experience
export const addExperience = async (req, res) => {
  try {
    const userId = req.user._id;
    const experienceData = req.body;
    
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ userId, experience: [] });
    }
    
    profile.experience.push(experienceData);
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: "Experience added successfully",
      experience: profile.experience
    });
  } catch (error) {
    console.log("Add Experience Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};

// Add project
export const addProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectData = req.body;
    
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = new UserProfile({ userId, projects: [] });
    }
    
    profile.projects.push(projectData);
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: "Project added successfully",
      projects: profile.projects
    });
  } catch (error) {
    console.log("Add Project Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};
