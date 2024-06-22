import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const cloudinaryUploading = async (localFilePath, folderName) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: `bloggies/${folderName}`,
    });
    //file has been uploaded successfully
    fs.unlinkSync(localFilePath); //remove after uploading from local
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const deletionResponse = await cloudinary.uploader.destroy(publicId);
    return deletionResponse.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

export { cloudinaryUploading, deleteFromCloudinary };
