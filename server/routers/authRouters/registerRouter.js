import express from 'express';
import {registerEmployee,registerAdmin} from "../../controllers/index.js"

const registerRouter = express.Router();

registerRouter.post('/employee', registerEmployee);
registerRouter.post('/admin', registerAdmin);

export default registerRouter;
