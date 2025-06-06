import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Chat } from "../models/chatSchema.js";
import { Application } from "../models/applicationSchema.js";
import ErrorHandler from "../middlewares/error.js";

// Get or create chat for an application
export const getOrCreateChat = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const userId = req.user._id;

  // Verify application exists and user has access
  const application = await Application.findById(applicationId)
    .populate('applicantID employerID');

  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }

  // Check if user is either the applicant or employer
  const isApplicant = application.applicantID._id.toString() === userId.toString();
  const isEmployer = application.employerID._id.toString() === userId.toString();

  if (!isApplicant && !isEmployer) {
    return next(new ErrorHandler("Not authorized to access this chat", 403));
  }

  // Find existing chat or create new one
  let chat = await Chat.findOne({ applicationId })
    .populate('participants', 'name email role')
    .populate('messages.sender', 'name role');

  if (!chat) {
    chat = await Chat.create({
      applicationId,
      participants: [application.applicantID._id, application.employerID._id],
      messages: [],
      lastMessage: null
    });

    chat = await Chat.findById(chat._id)
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name role');
  }

  res.status(200).json({
    success: true,
    chat,
    application: {
      _id: application._id,
      jobTitle: application.jobTitle || "Job Application",
      applicantName: application.applicantID.name,
      employerName: application.employerID.name
    }
  });
});

// Send a message
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || !content.trim()) {
    return next(new ErrorHandler("Message content is required", 400));
  }

  // Find the chat
  let chat = await Chat.findOne({ applicationId });

  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  // Verify user is a participant
  if (!chat.participants.includes(userId)) {
    return next(new ErrorHandler("Not authorized to send messages in this chat", 403));
  }

  // Create new message
  const newMessage = {
    sender: userId,
    content: content.trim(),
    timestamp: new Date(),
    isRead: false
  };

  // Add message to chat
  chat.messages.push(newMessage);

  // Update last message
  chat.lastMessage = {
    content: content.trim(),
    timestamp: new Date(),
    sender: userId
  };

  // Update unread count
  const application = await Application.findById(applicationId);
  const isApplicant = application.applicantID.toString() === userId.toString();

  if (isApplicant) {
    chat.unreadCount.employer += 1;
  } else {
    chat.unreadCount.applicant += 1;
  }

  await chat.save();

  // Populate the new message
  const populatedChat = await Chat.findById(chat._id)
    .populate('messages.sender', 'name role')
    .populate('participants', 'name email role');

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    chat: populatedChat
  });
});

// Mark messages as read
export const markAsRead = catchAsyncErrors(async (req, res, next) => {
  const { applicationId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findOne({ applicationId });

  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  // Verify user is a participant
  if (!chat.participants.includes(userId)) {
    return next(new ErrorHandler("Not authorized", 403));
  }

  // Mark messages as read for the current user
  chat.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString()) {
      message.isRead = true;
    }
  });

  // Reset unread count for current user
  const application = await Application.findById(applicationId);
  const isApplicant = application.applicantID.toString() === userId.toString();

  if (isApplicant) {
    chat.unreadCount.applicant = 0;
  } else {
    chat.unreadCount.employer = 0;
  }

  await chat.save();

  res.status(200).json({
    success: true,
    message: "Messages marked as read"
  });
});

// Get all chats for a user
export const getUserChats = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'name email role')
    .populate('lastMessage.sender', 'name role')
    .populate({
      path: 'applicationId',
      select: 'jobTitle status applicantID employerID',
      populate: {
        path: 'applicantID employerID',
        select: 'name'
      }
    })
    .sort({ 'lastMessage.timestamp': -1 });

  res.status(200).json({
    success: true,
    chats
  });
});
