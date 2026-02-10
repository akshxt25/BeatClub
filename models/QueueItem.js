import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
    room:{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    }, song : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Song"
    }, addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, isSuggestedByAI: {
      type: Boolean,
      default: false,
    },

    position: {
      type: Number,
      required: true,
    },

} , {timestamps : true});

export default mongoose.model("QueueItem", queueSchema);