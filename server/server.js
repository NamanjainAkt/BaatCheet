import "dotenv/config"
import express from 'express'
import cors from 'cors'
import http from "http"
import { connectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { Server } from "socket.io"

//create express app and http server
const app = express()
app.use(cors({
  origin: 'https://baatcheet-nj.netlify.app',
  credentials: true,
}));
const server = http.createServer(app)

// initialize socket.io server
export const io = new Server(server, { cors: { origin: "*" } })
//store users online
export const userSocketMap = {}; //{userId : socketId}

//socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId
    console.log("user Connected", userId)

    if(userId) userSocketMap[userId] = socket.id

    //emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
        console.log("user Disconnected",userId)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

//middleware setup
app.use(express.json({ limit: '60mb' }))


//routes setup
app.use("/api/status", (req, res) => {
    res.send("Server is up and running")
})
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

const PORT = process.env.PORT || 5000

//connect to mongoDB
await connectDB()

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})




