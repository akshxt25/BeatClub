import express from "express"
import cors from "cors";
import { configDotenv } from "dotenv";
import {connectDb} from "./config/db.js";

configDotenv();

const app = express();

connectDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//     res.send("App is running");
// })

const PORT = process.env.PORT || 3000;


import roomRouter from "./routes/roomRoutes.js";
import userRouter from "./routes/userRoutes.js"

app.use("/api/room", roomRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
    console.log("App is running on port: ", PORT);
})

