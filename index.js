import express from "express";
import cors from "cors"
import { configDotenv } from "dotenv";
import {connectDb} from "./config/db.js";

configDotenv();

const app = express();

connectDb();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("App is running");
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("App is running on port: ", PORT);
})