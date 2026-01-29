import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            unique: true
        },
        rooms_owner:[],
        rooms_joined:[],
        songs_suggested:[],
    }, {timestamps: true});

export default mongoose.model("User", userSchema);