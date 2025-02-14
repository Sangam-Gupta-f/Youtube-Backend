import { asyncHandler } from "../utils/asyncHandlers.js";
import { User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import {UpoadtoCloud} from "../utils/uploadToCloudinary.js"
import jwt from "jsonwebtoken"
import { mongoose } from "mongoose";
// import {  } from "../middlewares/";
const userRegister=asyncHandler( async (req, res)=>{
    const { fullName, email, username,password}=req.body
    console.log(email,fullName);
    // if(fullName==""){
    //     throw now ApiError(400,"fullname dalo")
    // }
    if(
        [fullName, email, username,password].some((field)=>{return field.trim()===""})
    ){
        throw new ApiError(400,"fullname dalo");
    }

    //validation check
  const existenduser= await User.findOne({
        $or:[{username}, {email}]
    })
    if(existenduser){
        throw new ApiError(404, " erro h ")
    }
     
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImgLocalPath=req.files?.coverImg[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(404, " erro h ")
    }
       
   const avatar=await  UpoadtoCloud(avatarLocalPath);
   const coverImg=await  UpoadtoCloud(coverImgLocalPath);
//    if (!avatar) {
//     throw new ApiError(400, "Error while uploading on avatar")
//     }

    //create user in data base
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    

})

// tokens generate wala kaam

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
       // console.log(`userID ye h: ${userId}`)
       // console.log(`user ye h: ${user}`)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


// const generateAccesRefreshTokens=async (userId)=>{
//     try {
//        const user= await User.findById(userId)
//        const asscesToken=user.generateAccessToken()
//        const refreshToken=user.generateRefreshToken()
//        user.refreshToken=refreshToken
//        await user.save({validateBeforeSave: false})
//        return {asscesToken, refershToken}
//     } catch (error) {
//        throw new ApiError(500, "Tokens Ganerateme problem aa rhi h")
//     }
//   }


// Login Karao Bhai User Ko
 const loginUser=asyncHandler(async (req, res)=>{
        const {username, email, password}=req.body
        console.log(email);
        if(!username && !email){
            throw new ApiError(400, "username ya gmail nai mila h!!")
        }

      const user= await User.findOne({
            $or:[{username}, {email}]
        })
         
        if(!user){
            throw new ApiError(400, "user bhai phle register kr lo")
        }
       
       const passwordCheck= await user.isPasswordCorrect(password)
       console.log(password) //isPasswordCorrect
    //    if(!passwordCheck){
    //     throw new ApiError(401, " Please use correct password or chnage password")
    //    }
       
       const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id);
       const loggedInUser= await User.findById(user._id).
       select("-password -refreshToken")

       const option={
        httpOnly:true,
        secure:true
       }
        return res
        .status(200)
        .cookie("accessToken",accessToken, option)
        .cookie("refreshToken", refreshToken,option)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,accessToken,
                    refreshToken
                },
                "Logged In Ho gya h"
            )
        )



 })

 const logoutUser=asyncHandler( async (req,res)=>{
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
    .clearCookie("refershToken",options)
    .json(
        new ApiResponse(200,{}, "Logout Ho gya")
    )
 })

 const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const updatePassword=asyncHandler( async (req, res) => {
    const { oldPassword, newPassword}=req.body
    const user =await User.findById(req.user?.id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"oldpassword galat dal rhe ho")
    }
      user.password=newPassword;
      await user.save({validateBeforeSave:false}) 

      return res.status(200)
      .json(200,"Password Change ho gya h")
      
})

const GetCurrUser=asyncHandler(async (req,res) => {
    return res.status(200)
    .json(200, req.user, "Curr user fetched")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, // fullNane:fullName
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadToCloud(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})

export  {userRegister, GetCurrUser, updatePassword, updateUserAvatar, updateUserCoverImage, updateAccountDetails,
    loginUser, logoutUser, refreshAccessToken
}