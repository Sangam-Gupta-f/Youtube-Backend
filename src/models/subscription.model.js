import  mongoose , { Schema } from "mongoose";

const  subscriptionSchema= new Schema({
    subcriber:{
        type:Schema.types.ObjectId,
        ref: User
    }

},{timestamps: true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)