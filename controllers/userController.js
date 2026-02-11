import Room from "../models/Room.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password required",
    });
  }

  try {
    const existingUser = await User.findOne({ userName });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName: userName.trim(),
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      userId: user._id,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({
      success: false,
      message: "Name or password is missing",
    });
  }

  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        rooms_owner: user.rooms_owner,
        rooms_joined: user.rooms_joined,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");

  res.json({
    success: true,
    message: "Logged out",
  });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old and new password required",
    });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Old password incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating password",
    });
  }
};

export const getUserOwnedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      owner: req.user._id,
      isDeleted: false,
    });

    return res.json({
      success: true,
      rooms,
    });

  } catch (error) {
    console.error("Get Owned Rooms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching owned rooms",
    });
  }
};

export const getUserJoinedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      users: req.user._id,
      isDeleted: false,
    });

    return res.json({
      success: true,
      rooms,
    });

  } catch (error) {
    console.error("Get Joined Rooms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching joined rooms",
    });
  }
};

export const getUserSuggestedSongs = async (req, res) => {
  try {
    const songs = await Song.find({
      suggested_by: req.user._id,
    }).populate("suggested_in_room", "roomName");

    return res.json({
      success: true,
      songs,
    });

  } catch (error) {
    console.error("Get Suggested Songs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching suggested songs",
    });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const messages = await Chat.find({
      sender: req.user._id,
      isDeleted: false,
    })
      .populate("room", "roomName")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error("Get User Chats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user chats",
    });
  }
};