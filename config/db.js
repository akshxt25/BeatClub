import mongoose from "mongoose";

export const connectDb = async() => {
    try
    {
        const result = await mongoose.connect(process.env.MONGO_URL);
        console.log("Db Connected");
    } catch(err)
    {
        console.log("error occured in DB connection", err);
    }
}