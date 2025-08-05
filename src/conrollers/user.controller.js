import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from '../models/user.model.js'
import{ uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokken=async (userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken
        await user.save({validiteBeforeSave:false})

        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //get user details from fronted
    //validation -not empty
    //check if user already exist:username,email
    //check for image,check for avatar
    //upload them to cloudinary -avatar
    //create user object ,create entry in db
    //remove password and refresh tokken feild from response
    //check for user creation
    //return res

    const{username,fullname,email,password}=req.body;
    console.log({username , fullname , email , password});
    if(
        [username,fullname,email,password].some((feild)=>feild?.trim()=="")
    ){
        throw new ApiError(400,"All feilds are required")
    }

    const existingUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User with this username or email already exist")
    }
    
        console.log(req.files)
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // let avatarLocalPath="";
        // if(req.files && Array.isArray(req.files.avatar)&& req.files.avatar.length>0) {
        //     coverImageLocalPath=req.files.avatar[0].path
        // }

    //const coverImageLocalPath=req.files?.coverImage[0]?.path
    let coverImageLocalPath="";
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0) {
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"avatar file is required")
    }
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url|| "",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Sonething went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})
const loginUser=asyncHandler(async(req,res)=>{
    //req.body->data
    //username or password
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,username,password}=req.body;

    if(!email || !password){
        throw new ApiError(400,"Username or email is required")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokken(user._id)
    const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
        )

    )

})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incommingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;
    if(!incommingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }
    try {
        const decodedToken=jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user=await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }

    if(incommingRefreshToken!== user.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }

    const options={
        httpOnly:true,
        secure:true
    }

    const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokken(user._id)

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToen",newrefreshToken,options)
    .json(
        new ApiResponse(200,{accessToken,refreshToken:newrefreshToken},"Access Token refreshed")
    )
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid refresh token")
    }



})

export {registerUser,loginUser,logoutUser,refreshAccessToken}

//req.files wala code

/*{
  avatar: [
    {
      fieldname: 'avatar',
      originalname: 'Screenshot 2024-07-09 at 7.53.23 PM.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './public/temp',
      filename: 'Screenshot 2024-07-09 at 7.53.23 PM.png',
      path: 'public/temp/Screenshot 2024-07-09 at 7.53.23 PM.png',
      size: 2618055
    }
  ],
  coverImage: [
    {
      fieldname: 'coverImage',
      originalname: 'Screenshot 2024-07-02 at 3.13.34 PM.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './public/temp',
      filename: 'Screenshot 2024-07-02 at 3.13.34 PM.png',
      path: 'public/temp/Screenshot 2024-07-02 at 3.13.34 PM.png',
      size: 1181694
    }
  ]
}*/ 