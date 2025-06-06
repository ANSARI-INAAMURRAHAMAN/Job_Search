import mongoose from "mongoose";
import validator from "validator";

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    validator: [validator.isEmail, "Please enter a valid Email!"],
    required: [true, "Please enter your Email!"],
  },
  coverLetter: {
    type: String,
    required: [true, "Please enter your Cover Letter!"],
  },
  phone: {
    type: String,
    required: [true, "Please enter your Phone Number!"],
  },
  address: {
    type: String,
    required: [true, "Please enter your Address!"],
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  applicantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  employerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
},
{
  timestamps: true,
});

export const Application = mongoose.model("Application", applicationSchema);
