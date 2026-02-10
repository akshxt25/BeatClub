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
      required: true,
    },

    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isOpen: {
      type: Boolean,
      default: false,
    },

    maxUsers: {
      type: Number,
      default: 50,
    },

    currentSong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QueueItem",
    },

    queue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QueueItem",
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

    ownershipTransfer: {
      active: { type: Boolean, default: false },
      proposedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      expiresAt: Date,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
