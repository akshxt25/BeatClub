import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
    hash : {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
        unique: true
    }
} , {timestamps : true});

export default mongoose.model("Link", linkSchema);