import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const vedioSchema=new Schema({    
    vedio:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    discription:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    duration:{
        type:String,
        required:true,
    }

},{timestamps:true})

vedioSchema.plugin(mongooseAggregatePaginate)
export const Vdio=mongoose.model("Vedio",vedioSchema)