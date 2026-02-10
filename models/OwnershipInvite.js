import mongoose from "mongoose";

const ownershipInviteSchema = new mongoose.Schema({
    room:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Room",
        required : true
    },
    from :{
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    }, 
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum : ["Pending", "Accepted", "Rejected", "Expired"],
        default: "Pending"
    },
    expiresAt: Date //to maintain if the user sent invite wants to be admin or not

    
} ,{timestamps : true});

ownershipInviteSchema.index( //it does not mean only one invite per rooom , or only one invite per user, dono conditions same nahi ho sakti
  { room: 1, to: 1 },
  { unique: true }
);

export default mongoose.model("OwnershipInvite", ownershipInviteSchema);