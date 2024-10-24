import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";

import multer from "multer";
import fs from "fs";
import path from "path";

import { connectDB } from "./services/index.js";
import { authenticateToken } from "./middlewares/index.js";
import { logger } from "./utils/index.js";
import { registerRouter, loginRouter, userRouter } from "./routers/index.js";

// const corsOptions = {
//   origin: ["*"],
//   methods: "POST, GET , PATCH",
//   credentials: true,
// };

const app = express();
const PORT = process.env.PORT;
// app.use(cors(corsOptions));

const corsOptions = {
    origin: ["*"],
    methods: "POST, GET , PATCH",
    credentials: true,
};

app.use(cors(corsOptions));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create a POST route to handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      message: "File uploaded successfully",
      file: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});
// app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/user", userRouter);

app.use(authenticateToken);

app.get("/", (req, res) => {
  res.send("<h1>Hello Wordl</h1>");
});

app.listen(PORT, () => {
  logger.info(`server running on port ${PORT}`);
});
