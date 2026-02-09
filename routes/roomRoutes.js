import express from "express"
import { createRoom, deleteRoom, exitRoom } from "../controllers/roomController.js"

const router = express.Router();

router.post("/", createRoom);
router.delete("/",deleteRoom);
router.post("/exitRoom", exitRoom);

export default router;