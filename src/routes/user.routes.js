import { Router } from "express";
import { userRegister} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js ";
const router=Router()

router.route("/register").post(
    upload.fields([
        {
         name:"avatar",
         maxCnt:1
        },
        {
         name:"coverImg"
        }
    ])
    ,userRegister)


export default router