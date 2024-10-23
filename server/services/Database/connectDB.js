import mongoose from "mongoose"
import "dotenv/config"
import { logger } from "../../utils/index.js"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL,{
            autoIndex:false
        })
        logger.info('connected to database successfully');
    } catch (err) {
        console.error(err)
    }
}

export default connectDB