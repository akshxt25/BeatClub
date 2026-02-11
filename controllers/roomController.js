import Link from "../models/Link.js";
import Room from "../models/Room.js";
import Song from "../models/Song.js";
import User from "../models/User.js";
import QueueItem from "../models/QueueItem.js";

export const createRoom = async (req, res) => {
  const { roomName, isOpen } = req.body;

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
      users: [req.user._id],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms_owner: createdRoom._id, rooms_joined: createdRoom._id },
    });

    const hash = crypto.randomBytes(6).toString("hex");

    await Link.create({
      roomId: createdRoom._id,
      hash,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: createdRoom,
      shareLink: `/share/${hash}`,
    });
  } catch (error) {
    return res.status(401).json("Some error in room creation");
  }
};

export const deleteRoom = async (req, res) => {
  const { roomName } = req.body;
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }

    const checkValidRoom = await Room.findOne({ roomName });

    if (!checkValidRoom) {
      return res.status(401).json("Invalid room name");
    }

    const room = await Room.findOne({
      owner: req.user._id,
    });

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
      { $pull: { rooms_joined: room._id } },
    );

    const result = await Room.deleteOne({ _id: room._id });

    console.log("result of deleting room: ", result);

    return res.status(200).json({
      success: true,
      message: "Room deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false });
  }
};

// export const shareRoomLink = async (req, res) => {
//   const {roomName , share} = req.body;
//   const user = req.user;

//   if(!user){
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized"
//     })
//   }

//   try {
//     const room = await Room.findOne({
//       roomName: roomName
//     })

//     if(!room){
//       return res.status(401).json({
//         success: false,
//         message: "Room not found"
//       })
//     }

//     const isOwner = room.owner.toString() === user._id.toString();
//     const isAdmin = room.admins.some(
//       id => id.toString() === user._id.toString()
//     );

//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({
//         success: false,
//         message: "Only owner/admin can share room",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Some error occured"
//     })
//   }
// };

export const shareRoomContent = async (req, res) => {
  const { sharelink } = req.params;

  try {
    const link = await Link.findOne({ hash: sharelink });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Invalid share link"
      });
    }

    const room = await Room.findById(link.roomId)
      .populate("owner", "userName")
      .populate({
        path: "currentSong",
        populate: { path: "song" }
      })
      .populate({
        path: "queue",
        populate: { path: "song" }
      });

    return res.json({
      success: true,
      room
    });

  } catch (error) {
    console.error("Share Room Content Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching room"
    });
  }
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
      (id) => id.toString() === existingRoom._id.toString(),
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

export const toogleRoomState = async (req, res) => {
  const { roomName, isOpen } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "You are not logged in",
    });
  }
  try {
    const room = await Room.findOneAndUpdate(
      {
        roomName: roomName,
        owner: user._id,
      },
      {
        isOpen: !isOpen,
      },
      {
        new: true,
      },
    );

    if (!room) {
      return res.status(401).json({
        success: false,
        message: "Owner or RoomName not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room state updated successfully",
      room,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Error in toggling Room's State",
    });
  }
};

export const removeMember = async (req, res) => {
  const { userToDelete, roomName } = req.body;
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "You are not logged in",
    });
  }
  try {
    const room = await Room.findOne({
      owner: user._id,
      roomName: roomName,
    });

    if (!room) {
      return res.status(401).json({
        success: false,
        messsage: "Room or Owner not found",
      });
    }

    const isMember = room.users.some(
      (id) => id.toString() === userToDelete.toString(),
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this room",
      });
    }

    if (userToDelete.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Owner cannot be removed",
      });
    }

    room.users.pull(userToDelete);
    await room.save();

    return res.status(201).json({
      success: true,
      message: "User removed from room",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Error in removing member",
    });
  }
};

export const addSongToRoomQueue = async (req, res) => {
  const { roomName, song } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (!song || typeof song !== "string") {
    return res.status(400).json({
      success: false,
      message: "Song must be a valid string URL",
    });
  }

  try {
    const room = await Room.findOne({ roomName });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room does not exist",
      });
    }

    const isUserInRoom = room.users.some(
      (id) => id.toString() === user._id.toString(),
    );

    if (!isUserInRoom) {
      return res.status(403).json({
        success: false,
        message: "User is not part of this room",
      });
    }

    const newSong = await Song.create({
      url: song,
      suggested_by: user._id,
      suggested_in_room: room._id,
    });

    const position = room.queue.length + 1;

    const queueItem = await QueueItem.create({
      room: room._id,
      song: newSong._id,
      addedBy: user._id,
      position,
    });

    room.queue.push(queueItem._id);

    if (!room.currentSong) {
      room.currentSong = queueItem._id;
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Song added to room queue",
      queueItem,
    });
  } catch (error) {
    console.error("Add Song Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding song to room",
    });
  }
};

export const removeSongFromQueue = async (req, res) => {
  const { roomName, queueItemId } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const room = await Room.findOne({ roomName });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const queueItem = await QueueItem.findById(queueItemId);

    if (!queueItem) {
      return res.status(404).json({
        success: false,
        message: "Song not found in queue",
      });
    }

    const isOwner = room.owner.toString() === user._id.toString();
    const isAdmin = room.admins.some(
      (id) => id.toString() === user._id.toString(),
    );
    const isAdder = queueItem.addedBy.toString() === user._id.toString();

    if (!isOwner && !isAdmin && !isAdder) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to remove this song",
      });
    }

    room.queue = room.queue.filter((id) => id.toString() !== queueItemId);

    if (room.currentSong?.toString() === queueItemId) {
      room.currentSong = room.queue[0] || null;
    }

    await queueItem.deleteOne();

    const remainingItems = await QueueItem.find({ room: room._id }).sort(
      "position",
    );

    for (let i = 0; i < remainingItems.length; i++) {
      remainingItems[i].position = i + 1;
      await remainingItems[i].save();
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Song removed from queue",
    });
  } catch (error) {
    console.error("Remove Song Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing song",
    });
  }
};

export const playNextSong = async (req, res) => {
  const { roomName } = req.body;
  const user = req.user();
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "you are not logged in",
    });
  }
  try {
    const room = await Room.findOne({
      roomName: roomName,
    });
    if (!room) {
      return res.status(401).json({
        success: false,
        message: "Room not found",
      });
    }
    const isOwner = room.owner.toString() === user._id.toString();
    const isAdmin = room.admins.some(
      (id) => id.toString() === user._id.toString(),
    );
    if (!isOwner && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Only admin or owner can change the song",
      });
    }

    if (!room.currentSong) {
      return res.status(401).json({
        success: false,
        message: "No current song playing",
      });
    }

    const currentItem = await QueueItemm.findById(room.currentSong);

    const nextItem = await Queue.findOne({
      room: room._id,
      position: currItem.position + 1,
    });

    if (!nextItem) {
      room.currentSong = null;
    } else {
      room.currentSong = nextItem._id;
    }

    await room.save();

    return res.status(201).json({
      success: true,
      message: "Next song played successfully",
    });
  } catch (error) {
    console.error("Play Next Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error playing next song",
    });
  }
};

export const setCurrentSong = async (req, res) => {
  const { roomName, queueItemId } = req.body;
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const room = await Room.findOne({ roomName: roomName });
    if (!room) {
      return res.status(401).json({
        success: false,
        message: "Room not found",
      });
    }

    const isOwner = room.owner._id.toString() === user._id.toString();
    const isAdmin = room.users.some(
      (id) => id.toString() === user._id.toString(),
    );

    if (!isOwner && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Only onwner or admin can set the current song",
      });
    }

    const queueItem = await QueueItem.findOne({
      room: room._id,
      _id: queueItemId,
    });

    if (!queueItem) {
      return res.status(404).json({
        success: false,
        message: "Song not found in this room",
      });
    }

    room.currentSong = queueItem._id;
    await room.save();

    return res.status(200).json({
      success: true,
      message: "Current song updated",
      currentSong: queueItem,
    });
  } catch (error) {
    console.error("Set Current Song Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error setting current song",
    });
  }
};

export const getRoomDetails = async (req, res) => {
  const { roomName } = req.params;

  try {
    const room = await Room.findOne({ roomName })
      .populate("owner", "userName")
      .populate("admins", "userName")
      .populate({
        path: "currentSong",
        populate: {
          path: "song",
          model: "Song",
        },
      })
      .populate({
        path: "queue",
        populate: [
          {
            path: "song",
            model: "Song",
          },
          {
            path: "addedBy",
            model: "User",
            select: "userName",
          },
        ],
        options: { sort: { position: 1 } },
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get Room Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching room details",
    });
  }
};

export const getRoomUsers = async (req, res) => {
	const {roomName} = req.body;
	
	try{
	const room = await Room.findOne({ roomName })
		 .populate("owner", "userName")
     .populate("admins", "userName")
     .populate("users", "userName");
		
		if(!room){
			return res.status(401).json({ 
				success: false,
				message: "Room not found"
			})
		}
		
		return res.status(200).json({
      success: true,
      users: {
        owner: room.owner,
        admins: room.admins,
        members: room.users,
      },
    });
	} catch (error){
		console.error("Get Room Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching room users",
    });
	}
};

export const clearSongQueue = async (req, res) => {
  const {roomName} = req.body;
  const user = req.user;

  if(!user){
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    })
  };
  try{
    const room  = await Room.findOne({
      roomName : roomName
    })

    if(!room){
      return res.status(401).json({
        success: false,
        message: "Room not found"
      })
    }

    const isOwner = room.owner._id.toString() === user._id.toString()
    const isAdmin = room.admins.some(
      id => id.toString() === user._id.toString()
    )

    if(!isOwner && isAdmin){
      return res.status(401).json({
        success: false,
        message: "Only the Owner or Admin may clear the queue"
      })
    }

    const queueItems = await QueueItem.find({
      room : room._id
    })
    
    const songIds = queueItems.map(item => item.song)

    await QueueItem.deleteMany({ room: room._id})

    await Song.deleteMany({ _id: { $in: songIds } });

    room.queue = [];
    room.currentSong = null;

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Queue cleared successfully",
    });


  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Some error occured in clearing queue"
    })
  }
};

export const sendRoomMessage = async (req, res) => {
  const { roomName, message } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "Message cannot be empty" });
  }

  try {
    const room = await Room.findOne({ roomName });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isMember =
      room.owner.toString() === user._id.toString() ||
      room.admins.some(id => id.toString() === user._id.toString()) ||
      room.users.some(id => id.toString() === user._id.toString());

    if (!isMember) {
      return res.status(403).json({ success: false, message: "Not a member of this room" });
    }

    const newMessage = await Chat.create({
      room: room._id,
      sender: user._id,
      message: message.trim(),
    });

    await newMessage.populate("sender", "userName");

    return res.status(201).json({
      success: true,
      message: newMessage,
    });

  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ success: false, message: "Error sending message" });
  }
};

export const getRoomChat = async (req, res) => {
  const { roomName } = req.params;
  const { page = 1, limit = 20 } = req.query;

  try {
    const room = await Room.findOne({ roomName });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const messages = await Chat.find({ room: room._id, isDeleted: false })
      .populate("sender", "userName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error("Get Chat Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching chat" });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const message = await Chat.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const room = await Room.findById(message.room);

    const isOwner = room.owner.toString() === user._id.toString();
    const isAdmin = room.admins.some(id => id.toString() === user._id.toString());
    const isSender = message.sender.toString() === user._id.toString();

    if (!isOwner && !isAdmin && !isSender) {
      return res.status(403).json({ success: false, message: "Not allowed to delete this message" });
    }

    message.isDeleted = true;
    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message deleted",
    });

  } catch (error) {
    console.error("Delete Message Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting message" });
  }
};

export const clearRoomChat = async (req, res) => {
  const { roomName } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const room = await Room.findOne({ roomName });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isOwner = room.owner.toString() === user._id.toString();
    const isAdmin = room.admins.some(id => id.toString() === user._id.toString());

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Only owner/admin can clear chat" });
    }

    await Chat.updateMany(
      { room: room._id },
      { $set: { isDeleted: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Room chat cleared",
    });

  } catch (error) {
    console.error("Clear Chat Error:", error);
    return res.status(500).json({ success: false, message: "Error clearing chat" });
  }
};