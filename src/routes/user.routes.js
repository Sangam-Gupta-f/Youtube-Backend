import { Router } from "express";
import {logoutUser ,loginUser, userRegister} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js ";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

export default router