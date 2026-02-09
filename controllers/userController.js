import Room from "../models/Room.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

export const signup = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      password: hashedPassword,
    });

    if (!user || !user._id) {
      throw new Error("User not returned after creation");
    }

    return res.status(201).json({
      success: true,
      userId: user._id,
      message: "User created successfully",
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
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

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
