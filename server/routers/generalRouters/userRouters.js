import express from 'express';
import {getAllEmployee,getCallStats,getTotalCallHoursAndIncrease,getCallStatsForPastWeek,getOverallAvgSatisfaction} from "../../controllers/index.js"

const userRouter = express.Router();

userRouter.get('/getAllEmployee', getAllEmployee);
userRouter.get('/getCallStats',getCallStats)
userRouter.get('/getTotalHours',getTotalCallHoursAndIncrease)
userRouter.get('/getWeeklyStats',getCallStatsForPastWeek)
userRouter.get('/getAvgSatisfaction',getOverallAvgSatisfaction)

export default userRouter;
