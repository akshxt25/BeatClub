import Link from "../models/Link.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

export const createRoom = async (req, res) => {
  const { roomName, id } = req.body;
  console.log(req.body);
  if (!roomName) {
    return res.status(400).json({
      success: false,
      message: "'roomName' is required in request body",
    });
  }
  try {
    const room = await Room.create({ roomName });

    console.log("room created", room);

    return res.status(201).json({ success: true, data: room });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false });
  }
};

export const deleteRoom = async (req, res) => {
  const { roomName, id } = req.body;

  try {
    const checkValidRoom = await Room.findOne({ roomName });

    if (!checkValidRoom) {
      return res.status(401).json("Invalid room name");
    } else {
      await Room.deleteOne({ roomName });
    }

    return res.status(200).json({
      success: true,
      message: "Room deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false });
  }
};

export const shareRoomLink = async (req, res) => {
  const share = req.body.share;

  if (share) {
    const existingLink = await Link.findOne({
      userId: req.userId,
    });

    if (existingLink) {
      res.json({
        hash: existingLink.hash,
      });
      return;
    }

    const hash = random(8);
    console.log("generated hash: ", hash);

    await LinkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      hash: hash,
    });
  } else {
    await LinkModel.deleteOne({
      //@ts-ignore
      userId: req.userId,
    });
    res.json({
      message: "Removed Link",
    });
  }
};

export const shareRoomContent = async (req, res) => {
  const hash = req.params.sharelink;

    const link = await Link.findOne({
        hash : hash, 
    })

    if(!link){
        res.status(411).json({
            message : "Sorry incorrect input"
        })
        return ;            
    }

    const content = await ContentModel.find({
        userId : link.userId,
    })

    const user = await UserModel.findOne({
        _id : link.userId               
    })

    if(!user){
        res.status(411).json({
            message : "User not found , error should ideally not happen"
        })
        return;
    }

    res.json({                              
        username : user.username,   
        content : content 
    })
};
