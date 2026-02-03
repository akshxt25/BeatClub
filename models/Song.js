import mongoose from mongoose;

const songSchema = new mongoose.Schema(
    {
        url:{
            type: String,
            required: true,
        },
        suggested_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        suggested_in_room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        },
    }, {timestamps: true});

export default mongoose.model("Song", songSchema);