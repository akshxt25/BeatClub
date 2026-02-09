import express from "express"
import { addSongToRoomQueue, createRoom, deleteRoom, exitRoom, joinRoom, shareRoomContent } from "../controllers/roomController.js"
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyJWT);
router.post("/", createRoom);
router.delete("/",deleteRoom);
router.post("/exitRoom", exitRoom);
router.post("/joinRoom", joinRoom);
router.post("/shareRoomContent",shareRoomContent);
router.post("/addSongToRoomQueue", addSongToRoomQueue);


export default router;