import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
//signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body
    try {
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({ fullName, email, password: hashedPassword, bio })
        const token = generateToken(newUser._id)
        res.json({ success: true, message: "User created successfully", userData: newUser, token })

    } catch (error) {
        console.log(error.message).
            res.json({ success: false, message: error.message })
    }
};

//login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        const userData = await User.findOne({ email })
        if (!userData) {
            return res.status(400).json({ success: false, message: "User not found" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }

        const token = generateToken(userData._id)
        res.json({ success: true, message: "User logged in successfully", userData, token })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

//controller to check if user is authenticated
export const checkAuth = (req, res) => {
    // Change from false to true since if we reach here, user is authenticated
    res.json({ success: true, user: req.user })
}

//controller to update user profile detail

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body
        const userId = req.user._id
        let updatedUser
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })

        }
        res.json({ success: true, user: updatedUser })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}