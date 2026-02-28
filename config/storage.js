import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "auto",
    folder: "angilstech/content", // Optional: set the folder in Cloudinary where you want to store the files
    allowedFormats: ['jpg', 'png', 'gif', 'mp4'],
  },
});

export default storage;




