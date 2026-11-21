import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSocket } from "./SocketContext"
import { useAuth } from "./AuthContext"
import { MSG_TYPES, createGetNotificationsMsg } from "../api/protocol"

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { subscribe, request } = useSocket()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((title, message, incidentId = null) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, title, message, incidentId }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 6000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Fetch persisted notifications when authenticated
  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const reply = await request(createGetNotificationsMsg(), MSG_TYPES.NOTIFICATIONS_LIST)
      if (reply.notifications) {
        setNotifications(reply.notifications)
        const unread = reply.notifications.filter((n) => !n.is_read).length
        setUnreadCount(unread)
      }
    } catch {
      // Background notification fetch failure is non-blocking
    }
  }, [user, request])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
      setToasts([])
    }
  }, [user, fetchNotifications])

  // Listen to unsolicited server push notifications
  useEffect(() => {
    // 1. Unread notifications push on login
    const unsubUnread = subscribe(MSG_TYPES.UNREAD_NOTIFICATIONS, (msg) => {
      if (msg.notifications && msg.notifications.length > 0) {
        setNotifications((prev) => [...msg.notifications, ...prev])
        setUnreadCount((prev) => prev + msg.notifications.length)
      }
    })

    // 2. New incident reported (pushed to admins)
    const unsubNewInc = subscribe(MSG_TYPES.NEW_INCIDENT, (msg) => {
      const inc = msg.incident
      if (inc) {
        addToast("New emergency reported", `#${inc.id}: ${inc.title} at ${inc.location}`, inc.id)
        setNotifications((prev) => [
          {
            id: Date.now(),
            incident_id: inc.id,
            message: `New incident reported: ${inc.title}`,
            created_at: new Date().toISOString(),
            is_read: 0
          },
          ...prev
        ])
        setUnreadCount((c) => c + 1)
      }
    })

    // 3. Assignment received (pushed selectively to assigned responder)
    const unsubAssign = subscribe(MSG_TYPES.ASSIGNMENT_RECEIVED, (msg) => {
      const inc = msg.incident
      addToast(
        "Emergency assignment",
        `You have been assigned to incident #${msg.incident_id} by ${msg.assigned_by}`,
        msg.incident_id
      )
      setNotifications((prev) => [
        {
          id: Date.now(),
          incident_id: msg.incident_id,
          message: `Assigned to incident #${msg.incident_id}: ${inc ? inc.title : ""}`,
          created_at: new Date().toISOString(),
          is_read: 0
        },
        ...prev
      ])
      setUnreadCount((c) => c + 1)
    })

    // 4. Status update push (pushed to student and admins)
    const unsubUpdate = subscribe(MSG_TYPES.INCIDENT_UPDATE, (msg) => {
      addToast(
        "Incident status updated",
        `Incident #${msg.incident_id} is now ${msg.new_status}`,
        msg.incident_id
      )
      setNotifications((prev) => [
        {
          id: Date.now(),
          incident_id: msg.incident_id,
          message: `Incident #${msg.incident_id} status changed to ${msg.new_status}`,
          created_at: new Date().toISOString(),
          is_read: 0
        },
        ...prev
      ])
      setUnreadCount((c) => c + 1)
    })

    return () => {
      unsubUnread()
      unsubNewInc()
      unsubAssign()
      unsubUpdate()
    }
  }, [subscribe, addToast])

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markAllRead,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider")
  return context
}
