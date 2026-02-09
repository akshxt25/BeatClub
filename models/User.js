import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userName:{
            type: String,
            required: true,
            unique: true
        },
        rooms_owner:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        }],
        rooms_joined:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        }],
        songs_suggested:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
        }],
        password: {
            type: String, 
            required: true
        },
        chat:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }
    }, {timestamps: true});

export default mongoose.model("User", userSchema);