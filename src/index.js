//  require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
dotenv.config({
    path: './.env'
})



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})











// (async () =>{
//  try {
    
//     await mongoose.connect(`mongodb+srv://sangamg7318:Ramram@123@cluster0.ekc3m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/${DB_Name}`);
//     app.on("error", (error)=>{
//         console.log("Error in APP.on me hai: ", error);
//         throw error;
//     })  
//     app.listen(process.env.PORT,()=>{
//        console.log(`App is running on Port:  ${process.env.PORT}`);
//     })
// } catch (error) {
//     console.log("Error h ji", error)
//     throw error
//  }
// })();
