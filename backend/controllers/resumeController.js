import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { extractDataFromResume } from "../services/geminiService.js";
import Tesseract from 'tesseract.js';

export const processResumeWithAI = catchAsyncErrors(async (req, res, next) => {
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
    // Extract text from image using OCR
    const { data: { text } } = await Tesseract.recognize(resume.tempFilePath, 'eng');
    
    if (!text || text.trim().length < 50) {
      return next(new ErrorHandler("Could not extract sufficient text from resume image", 400));
    }

    // Process with Gemini AI
    const extractedData = await extractDataFromResume(text);
    
    res.status(200).json({
      success: true,
      message: "Resume processed successfully",
      data: extractedData,
      extractedText: text // Optional: send back extracted text for debugging
    });

  } catch (error) {
    console.error('Resume processing error:', error);
    return next(new ErrorHandler("Failed to process resume", 500));
  }
});
