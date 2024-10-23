import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./services/index.js";
import { authenticateToken } from "./middlewares/index.js"; 
import {logger} from "./utils/index.js"

const app = express();
const PORT = process.env.PORT;


// app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use(authenticateToken);

app.listen(PORT,()=>{
    logger.info(`server running on port ${PORT}`)
})
