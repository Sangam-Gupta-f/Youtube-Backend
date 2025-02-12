import { asyncHandler } from "../utils/asyncHandlers.js";
import { User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";
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
  const existenduser=  User.findOne({
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
       
   const sn=await  uploadToColudinary(avatarLocalPath);
})


export  {userRegister}