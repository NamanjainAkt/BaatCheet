import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, required: true },
    profilePic:{type:String, default:""},
    bio: { type: String},
}, { timestamps: true })

export const User = mongoose.model('User', userSchema)