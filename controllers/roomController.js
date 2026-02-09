import Link from "../models/Link.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

export const createRoom = async (req, res) => {
  const { roomName, isOpen } = req.body;
  console.log(req.body);
  if (!roomName) {
    return res.status(401).json({
      message: "Room Name not found",
      success: false,
    });
  }
  try {
    console.log("hete");
    const existingRoom = await Room.findOne({
      roomName: roomName,
    });

    if (existingRoom) {
      return res.status(401).json({
        message: "Room with this name already exists",
        success: false,
      });
    }
    console.log("user", req.user._id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const createdRoom = await Room.create({
      roomName: roomName,
      owner: req.user._id,
      isOpen: isOpen,
      users: [req.user._id]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms_owner: createdRoom._id },
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: createdRoom,
    });

  } catch (error) {
    return res.status(401).json("Some error in room creation");
  }
};

export const deleteRoom = async (req, res) => {
  const { roomName } = req.body;
  try {
    
    if(!req.user){
      return res.status(401).json({
        success: false,
        message: "User not logged in"
      })
    }

    const checkValidRoom = await Room.findOne({ roomName });

    if (!checkValidRoom) {
      return res.status(401).json("Invalid room name");
    } 

    const room = await Room.findOne({
      owner: req.user._id
    })

    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the owner of this room",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { rooms_owner: room._id },
    });

    await User.updateMany(
      { rooms_joined: room._id },
      { $pull: { rooms_joined: room._id } }
    );

    const result = await Room.deleteOne({ _id: room._id });

    console.log("result of deleting room: ",result);

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
    hash: hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }

  const content = await ContentModel.find({
    userId: link.userId,
  });

  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "User not found , error should ideally not happen",
    });
    return;
  }

  res.json({
    username: user.username,
    content: content,
  });
};

export const joinRoom = async (req, res) => {
  const { roomName } = req.body;
  const existingRoom = await Room.findOne({
    roomName: roomName,
  });
  if (!existingRoom) {
    return res.status(401).json({
      success: false,
      message: "Room does not exist",
    });
  }
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingRoom.users.includes(user._id)) {
      return res.status(401).json({
        success: false,
        messaage: "User is already in the room",
      });
    }

    //const addUserToRoom =  await Room.push(user._id);
    existingRoom.users.push(user._id);
    await existingRoom.save();

    const alreadyJoined = req.user.rooms_joined.some(
      id => id.toString() === existingRoom._id.toString()
    );

    if (!alreadyJoined) {
      req.user.rooms_joined.push(existingRoom._id);
      await req.user.save();
    }

    return res.status(200).json({
      success: true,
      message: "User joined successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error in room joining",
    });
  }
};

export const exitRoom = async (req, res) => {
  const { roomName } = req.body;
  const user = req.user;
  try {
    const room = await Room.findOne({
      roomName: roomName,
    });

    if (!room) {
      return res.status(401).json({
        success: false,
        message: "Room does not exsist",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not logged in",
      });
    }

    //room.users.deleteOne(user._id); //room.users is a js array, and arrays do not have deleteOne, deleteOne is a mongoDb method
    room.users.pull(user._id);
    await room.save();

    await user.rooms_joined.pull(room._id);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Exited room successfully",
      room: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      messgae: "some error in exiting room",
    });
  }
};
