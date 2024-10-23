import { createLogger, format, transports } from "winston";
const { combine, colorize, timestamp, printf } = format;

const myFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp}  [${level}]: ${message}`;
});

const logger = createLogger({
  level: "silly",
  format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), myFormat),
  transports: [new transports.Console()],
});

export default logger;