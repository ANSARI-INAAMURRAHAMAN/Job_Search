import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
    required: [true, "User role required"],
    enum: ["Job Seeker", "Employer", "PENDING"], // Add PENDING as valid enum
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Professional Information
  experience: [
    {
      jobTitle: {
        type: String,
        required: false,
      },
      company: {
        type: String,
        required: false,
      },
      location: {
        type: String,
        required: false,
      },
      startDate: {
        type: Date,
        required: false,
      },
      endDate: {
        type: Date,
        required: false,
      },
      isCurrentJob: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        required: false,
      },
      skills: [
        {
          type: String,
        },
      ],
    },
  ],

  education: [
    {
      degree: {
        type: String,
        required: false,
      },
      institution: {
        type: String,
        required: false,
      },
      fieldOfStudy: {
        type: String,
        required: false,
      },
      startDate: {
        type: Date,
        required: false,
      },
      endDate: {
        type: Date,
        required: false,
      },
      grade: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
    },
  ],

  projects: [
    {
      title: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      technologies: [
        {
          type: String,
        },
      ],
      startDate: {
        type: Date,
        required: false,
      },
      endDate: {
        type: Date,
        required: false,
      },
      projectUrl: {
        type: String,
        required: false,
      },
      githubUrl: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        enum: ["In Progress", "Completed", "On Hold"],
        default: "Completed",
      },
    },
  ],

  skills: [
    {
      name: {
        type: String,
        required: false,
      },
      level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        default: "Intermediate",
      },
      category: {
        type: String,
        enum: [
          "Programming",
          "Framework",
          "Database",
          "Tool",
          "Soft Skill",
          "Other",
        ],
        default: "Other",
      },
    },
  ],

  // Additional Profile Information
  bio: {
    type: String,
    maxLength: [500, "Bio cannot exceed 500 characters"],
  },

  location: {
    city: String,
    country: String,
  },

  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String,
  },

  availability: {
    type: String,
    enum: ["Available", "Not Available", "Open to Opportunities"],
    default: "Available",
  },

  expectedSalary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: "USD",
    },
  },
},
{
  timestamps: true,
});


//ENCRYPTING THE PASSWORD WHEN THE USER REGISTERS OR MODIFIES HIS PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//COMPARING THE USER PASSWORD ENTERED BY USER WITH THE USER SAVED PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//GENERATING A JWT TOKEN WHEN A USER REGISTERS OR LOGINS, IT DEPENDS ON OUR CODE THAT WHEN DO WE NEED TO GENERATE THE JWT TOKEN WHEN THE USER LOGIN OR REGISTER OR FOR BOTH. 
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const User = mongoose.model("User", userSchema);
