import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  phone: {
    type: Number,
    required: [true, "Please enter your Phone Number!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a Password!"],
    minLength: [8, "Password must contain at least 8 characters!"],
    maxLength: [32, "Password cannot exceed 32 characters!"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "Please select a role"],
    enum: ["Job Seeker", "Employer"],
  },
  bio: {
    type: String,
    maxLength: [1000, "Bio cannot exceed 1000 characters!"],
  },
  location: {
    city: {
      type: String,
      maxLength: [50, "City name cannot exceed 50 characters!"],
    },
    country: {
      type: String,
      maxLength: [50, "Country name cannot exceed 50 characters!"],
    }
  },
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    description: String
  }],
  experience: [{
    jobTitle: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    isCurrentJob: { type: Boolean, default: false },
    description: String,
    skills: [String]
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    projectUrl: String,
    githubUrl: String,
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'On Hold'],
      default: 'Completed'
    }
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    category: {
      type: String,
      enum: ['Programming', 'Framework', 'Database', 'Tool', 'Soft Skill', 'Other'],
      default: 'Other'
    }
  }],
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypting the password when the user registers or modifies their password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// Comparing the user password entered by user with the user saved password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generating a JWT token when a user registers or logins, it depends on expiry time
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const User = mongoose.model("User", userSchema);
