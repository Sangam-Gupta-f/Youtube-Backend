import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        trim: true,
        index:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
       // index:true,
        unique:true
    },
    fullname:{
        type:String,
        required:true,
        lowercase:true,
        index:true,
    },
    avatar:{
        type:String,
        required:true
    },
    coverImg:{
        type:String,
    },
    watchhistory:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"vedio"
    }
    ],
    Token:{
        type:String
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true})
userSchema.pre("save", async function(){
    if(!this.isModefied("password"))return next();
    this.password=bcrypt.hash("this.password",10);
     next();
})

userSchema.methods.isPasswordCorrect= async function(password){
return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User" , userSchema);