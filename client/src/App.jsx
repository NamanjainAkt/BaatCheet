import React, { useContext } from 'react'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from "react-hot-toast"
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import giphy from './assets/giphy.gif'


function App() {
  const { authUser } = useContext(AuthContext)
  return (
    <div style={{backgroundImage:`url(${giphy})`}} className={`bg-cover backdrop-blur-xl`}>
      <Toaster />
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/profile' element={authUser?<ProfilePage />:<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
