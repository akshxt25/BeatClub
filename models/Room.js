import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        name:{

        },
        owner: {},
        isOpen: {},
        users: {},
        currentSongs: {},
        
    }, {timestamps: true});

export default mongoose.model("Room", roomSchema);