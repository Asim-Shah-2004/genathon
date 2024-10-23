import express from 'express';
import {getAllEmployee} from "../../controllers/index.js"

const userRouter = express.Router();

userRouter.get('/getAllEmployee', getAllEmployee);

export default userRouter;
