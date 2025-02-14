import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});

const UpoadtoCloud=async (LocalFilePath) => {
try {
    if(!LocalFilePath)return null;
// Upload an image
const response = await cloudinary.uploader
.upload(LocalFilePath, {
        resource_type: 'auto',
    }
)
console.log("file uploaded", response.url);
    return response;
} catch (error) {
fs.unlinkSync(LocalFilePath)
return null;
}


console.log(UpoadtoCloud);



}

export { UpoadtoCloud}