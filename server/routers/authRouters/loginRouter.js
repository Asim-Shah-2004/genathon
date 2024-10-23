import express from 'express';
import {login} from "../../controllers/index.js"

const loginRouter = express.Router();

loginRouter.post('/', login);

export default loginRouter;
