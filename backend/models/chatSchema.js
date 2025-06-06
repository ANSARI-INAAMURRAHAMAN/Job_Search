import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  unreadCount: {
    applicant: { type: Number, default: 0 },
    employer: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for better performance
chatSchema.index({ applicationId: 1 });
chatSchema.index({ participants: 1 });

export const Chat = mongoose.model("Chat", chatSchema);
