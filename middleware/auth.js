import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log("decodedToken:", decodedToken);

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
