import { createContext, useContext, useState } from "react"
import toast from "react-hot-toast"
import { useEffect } from "react"
import { AuthContext } from "./AuthContext"


export const ChatContext = createContext()
export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({})

    const { socket, axios } = useContext(AuthContext)

    //funnction to get all users for sidebar

    const getUsers = async () => {
        try {
            // Verify token is in headers
            if (!axios.defaults.headers.common["token"]) {
                const token = localStorage.getItem("token")
                if (token) {
                    axios.defaults.headers.common["token"] = token
                }
            }
            const { data } = await axios.get("/api/messages/users")
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function to get messages for selected user
    const getMessages = async () => {
        try {
            const { data } = await axios.get(`/api/messages/${selectedUser._id}`)
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to subscribe for selected user
    const subscribeToMessages = async () => {
        try {
            if (!socket) return
            socket.on("newMessage", (newMessage) => {
                if (selectedUser && newMessage.senderId === selectedUser._id) {
                    newMessage.seen = true
                    setMessages((prevMessages) => [...prevMessages, newMessage])
                    axios.put(`/api/messages/mark/${newMessage._id}`)
                } else {
                    setUnseenMessages((prevUnseenMessages) => ({
                        ...prevUnseenMessages, [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                    }))
                }
            })
        } catch (error) {
            toast.error(error.message)
        }
    }

    // function  to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage")
    }

    useEffect(() => {
        subscribeToMessages()
        return ()=> unsubscribeFromMessages()
    }, [socket,selectedUser])

    const value = {
        messages,users,selectedUser,getUsers,getMessages,sendMessage,setSelectedUser,unseenMessages,setUnseenMessages
    }


    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}
