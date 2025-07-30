import { v2 as cloudinary} from "cloudinary";
import { response } from "express";
import fs from "fs";
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
            const response=cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            console.log("file has been uploaded sucessfully",response.url);
            return response;
        
    }catch(error){
        fs.unlinkSync(localFilePath);// remove the locally savedtemporary file as the upload operation got failed
        return null;
    }
}


/*const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);*/