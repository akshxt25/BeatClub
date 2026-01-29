import mongoose from "mongoose";

export const connectDb = async() => {
    try
    {
        const result = await mongoose.connect(process.env.MONGO_URL);
    } catch(err)
    {
        console.log("error occured in DB connection", err);
    }
}