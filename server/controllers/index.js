import registerEmployee from "./authConrtollers/register/employeeRegister.js";
import registerAdmin from "./authConrtollers/register/adminRegister.js";
import login from "./authConrtollers/login/login.js";
import getAllEmployee from "./generalControllers/getAllEmployee.js";
import getCallStats from "./generalControllers/numberOfCalls.js";

export{
    registerEmployee,
    registerAdmin,
    login,
    getAllEmployee,
    getCallStats
}