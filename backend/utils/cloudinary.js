import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Log the configuration to verify credentials are loaded
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    console.log("Uploading to Cloudinary:", localFilePath);
    console.log("File exists:", fs.existsSync(localFilePath));
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder: "resumes",
      public_id: `resume_${Date.now()}`,
      overwrite: true
    });
    
    console.log("Cloudinary upload successful:", response.secure_url);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    // Clean up file if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return null;
  }
};

export default cloudinary;
