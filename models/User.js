import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{

        },
        rooms_owner:[],
        rooms_joined:[],
        
    })