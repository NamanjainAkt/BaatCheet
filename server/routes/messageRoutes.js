import express from 'express'
import { getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from '../controllers/messageController.js'
import {protectRoute} from "../middleware/auth.js"
const messageRouter = express.Router()

messageRouter.get("/users", protectRoute, getUserForSidebar)
messageRouter.get("/:id", protectRoute, getMessages)
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen)
messageRouter.post("/send/:id",protectRoute,sendMessage)
export default messageRouter