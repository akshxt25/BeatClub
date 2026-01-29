import mongoose from mongoose;

const songSchema = new mongoose.Schema(
    {
        url:{},
        suggested_by: {},
        suggested_in_room: {},
    }, {timestamps: true});

export default mongoose.model("Song", songSchema);