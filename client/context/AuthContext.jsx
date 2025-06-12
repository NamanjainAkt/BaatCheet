import { createContext, useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { io } from "socket.io-client"
const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl
export const AuthContext = createContext()
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)

    // Check authentication status
    const checkAuth = async () => {
        try {
            if (!token) return
            
            // Ensure token is in headers
            axios.defaults.headers.common["token"] = token
            
            const { data } = await axios.get("/api/auth/check")
            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            } else {
                // Clear everything if auth check fails
                handleLogout()
            }
        } catch (error) {
            // Clear everything if auth check fails
            handleLogout()
        }
    }

    // Centralized logout function
    const handleLogout = () => {
        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common["token"] = null
        if (socket) {
            socket.disconnect()
            setSocket(null)
        }
    }

    // Login function
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)
            if (data.success) {
                const newToken = data.token
                localStorage.setItem("token", newToken)
                axios.defaults.headers.common["token"] = newToken
                setToken(newToken)
                setAuthUser(data.userData)
                connectSocket(data.userData)
                toast.success(data.message)
                return true
            } else {
                toast.error(data.message)
                handleLogout() // Clear any partial state
                return false
            }
        } catch (error) {
            toast.error(error.message)
            handleLogout() // Clear any partial state
            return false
        }
    }

    // Check auth status when component mounts or token changes
    useEffect(() => {
        checkAuth()
    }, [token])

    // Initialize axios token from localStorage when app starts
    useEffect(() => {
        const storedToken = localStorage.getItem("token")
        if (storedToken) {
            axios.defaults.headers.common["token"] = storedToken
            setToken(storedToken)
        }
    }, [])

    //connect socket func to handle socket connection and online users updates
    const connectSocket = userData => {
        if (!userData || socket?.connected) return
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        })
        newSocket.connect()
        setSocket(newSocket)
        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds)
        })
    }

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout: handleLogout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}