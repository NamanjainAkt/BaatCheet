import Mongoose from "mongoose"

const messageSchema = new Mongoose.Schema({
    senderId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: { type: String },
    image: { type: String },
    seen: { type: Boolean, default: false }


}, { timestamps: true })

export const Message = Mongoose.model("Message", messageSchema)