import express from 'express';
import {getAllEmployee,getCallStats,getTotalCallHoursAndIncrease,getCallStatsForPastWeek} from "../../controllers/index.js"

const userRouter = express.Router();

userRouter.get('/getAllEmployee', getAllEmployee);
userRouter.get('/getCallStats',getCallStats)
userRouter.get('/getTotalHours',getTotalCallHoursAndIncrease)
userRouter.get('/getWeeklyStats',getCallStatsForPastWeek)

export default userRouter;
