import express from 'express';
import {getAllEmployee,getCallStats} from "../../controllers/index.js"

const userRouter = express.Router();

userRouter.get('/getAllEmployee', getAllEmployee);
userRouter.get('/getCallStats',getCallStats)

export default userRouter;
