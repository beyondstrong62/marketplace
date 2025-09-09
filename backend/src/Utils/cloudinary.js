import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


const uploadOnCloudinary = async (fileLocation) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    try {    
        if (!fileLocation) {
            throw new Error("Please provide a correct file location!");
        }

        const response = await cloudinary.uploader.upload(fileLocation, 
            { resource_type: "auto" });

        // Optionally log the uploaded file URL
        // console.log("File uploaded on Cloudinary: ", response.url);

        await fs.promises.unlink(fileLocation); // Asynchronous file deletion
        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error); // Log the error
        if (fileLocation) {
            await fs.promises.unlink(fileLocation); // Remove file if it exists
        }
        return null;
    }
};

export default uploadOnCloudinary;
