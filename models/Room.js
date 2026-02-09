import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //required: true,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    currentSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
    currentSongsInQueue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    roomContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
    },
    roomChat: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Room", roomSchema);
