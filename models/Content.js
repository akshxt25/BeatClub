import mongoose, { Mongoose } from "mongoose";

const contentSchema = new mongoose.Schema({
    songs : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song"
    },
    roomChat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    }
}, {timestamps: true});

export default mongoose.model("Content", contentSchema); 