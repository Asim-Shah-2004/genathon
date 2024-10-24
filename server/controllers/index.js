import registerEmployee from "./authConrtollers/register/employeeRegister.js";
import registerAdmin from "./authConrtollers/register/adminRegister.js";
import login from "./authConrtollers/login/login.js";
import getAllEmployee from "./generalControllers/getAllEmployee.js";
import getCallStats from "./generalControllers/numberOfCalls.js";
import getTotalCallHoursAndIncrease from "./generalControllers/getTotalHours.js";
import getCallStatsForPastWeek from "./generalControllers/getWeeklyStats.js";
import getOverallAvgSatisfaction from "./generalControllers/getAvgSatisfaction.js";

export{
    registerEmployee,
    registerAdmin,
    login,
    getAllEmployee,
    getCallStats,
    getTotalCallHoursAndIncrease,
    getCallStatsForPastWeek,
    getOverallAvgSatisfaction
}