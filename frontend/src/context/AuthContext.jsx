import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSocket } from "./SocketContext"
import { createLoginMsg, createLogoutMsg, MSG_TYPES } from "../api/protocol"

const AuthContext = createContext(null)

const SESSION_FLAG_KEY = "alertbridge_active_session"

export function AuthProvider({ children }) {
  const { request, send, connectionStatus } = useSocket()
  const [user, setUser] = useState(null)
  const [sessionNotice, setSessionNotice] = useState("")

  // On page reload, the browser's raw TCP socket closes and is recreated.
  // The server stores identity on the TCP connection, so page reload requires logging in again.
  useEffect(() => {
    const hadSession = sessionStorage.getItem(SESSION_FLAG_KEY)
    if (hadSession) {
      sessionStorage.removeItem(SESSION_FLAG_KEY)
      setSessionNotice("Session ended, please log in again")
    }
  }, [])

  // If connection drops, clear local identity
  useEffect(() => {
    if (connectionStatus === "disconnected" && user) {
      setUser(null)
      sessionStorage.removeItem(SESSION_FLAG_KEY)
      setSessionNotice("Connection lost, please log in again")
    }
  }, [connectionStatus, user])

  const login = useCallback(
    async (username, password) => {
      setSessionNotice("")
      const reply = await request(createLoginMsg(username, password), MSG_TYPES.LOGIN_SUCCESS)
      const userData = {
        user_id: reply.user_id,
        username: reply.username,
        role: reply.role
      }
      setUser(userData)
      sessionStorage.setItem(SESSION_FLAG_KEY, "true")
      return userData
    },
    [request]
  )

  const logout = useCallback(() => {
    send(createLogoutMsg())
    setUser(null)
    sessionStorage.removeItem(SESSION_FLAG_KEY)
  }, [send])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        sessionNotice,
        setSessionNotice,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
