import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxLength: 500
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  education: [{
    degree: String,
    college: String,
    graduationYear: String,
    fieldOfStudy: String,
    percentage: String
  }],
  skills: [{
    name: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate"
    }
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    isCurrentJob: {
      type: Boolean,
      default: false
    }
  }],
  projects: [{
    title: String,
    description: String,
    technologies: String,
    liveUrl: String,
    githubUrl: String,
    startDate: Date,
    endDate: Date
  }]
}, {
  timestamps: true
});

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
