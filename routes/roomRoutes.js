import express from "express"
import { createRoom, deleteRoom } from "../controllers/roomController.js"

const router = express.Router();

router.post("/", createRoom);
router.delete("/",deleteRoom);

export default router;