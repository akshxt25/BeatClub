import mongoose from "mongoose";

const roomPermissionsSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    canAddSong: Boolean,
    canRemoveSong: Boolean,
    canKickUser: Boolean,
  },
  { timestamps: true },
);

roomPermissionsSchema.index( //ensures only one document per user per room
  { room: 1, user: 1 },
  { unique: true }
);

export default mongoose.model("RoomPermissions", roomPermissionsSchema);
