import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"
import { MSG_TYPES } from "../api/protocol"

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [connectionStatus, setConnectionStatus] = useState("connecting") // connecting | connected | disconnected
  const wsRef = useRef(null)
  const listenersRef = useRef(new Map())
  const pendingRequestsRef = useRef([])
  const reconnectTimeoutRef = useRef(null)
  const backoffDelayRef = useRef(1000)

  const bridgeUrl = import.meta.env.VITE_BRIDGE_URL || "ws://localhost:8080"

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return
    }

    setConnectionStatus("connecting")

    try {
      const ws = new WebSocket(bridgeUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus("connected")
        backoffDelayRef.current = 1000
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const msgType = data.type

          // Resolve pending request promises if this reply matches
          const remainingPending = []
          for (const pending of pendingRequestsRef.current) {
            // Match success reply
            if (pending.expectedType && msgType === pending.expectedType) {
              pending.resolve(data)
              continue
            }
            // Match error reply for this specific request type
            if (msgType === MSG_TYPES.ERROR && data.request && data.request === pending.requestType) {
              pending.reject(new Error(data.message || "Request failed"))
              continue
            }
            remainingPending.push(pending)
          }
          pendingRequestsRef.current = remainingPending

          // Dispatch to type-specific push/reply subscribers
          const callbacks = listenersRef.current.get(msgType)
          if (callbacks) {
            callbacks.forEach((cb) => {
              try {
                cb(data)
              } catch {
                // Ignore subscriber runtime error to prevent breaking the socket loop
              }
            })
          }

          // Also dispatch to wildcard listeners
          const wildcardCallbacks = listenersRef.current.get("*")
          if (wildcardCallbacks) {
            wildcardCallbacks.forEach((cb) => cb(data))
          }
        } catch {
          // Non-JSON frame ignored
        }
      }

      ws.onclose = () => {
        setConnectionStatus("disconnected")
        wsRef.current = null

        // Schedule automatic reconnect with exponential backoff capped at 10s
        const nextDelay = Math.min(backoffDelayRef.current * 1.5, 10000)
        backoffDelayRef.current = nextDelay
        reconnectTimeoutRef.current = setTimeout(connect, nextDelay)
      }

      ws.onerror = () => {
        // ws.onclose handles the reconnection logic
      }
    } catch {
      setConnectionStatus("disconnected")
    }
  }, [bridgeUrl])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [connect])

  const send = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
      return true
    }
    return false
  }, [])

  // Send request and await server reply
  const request = useCallback((payload, expectedType, timeoutMs = 7000) => {
    return new Promise((resolve, reject) => {
      const success = send(payload)
      if (!success) {
        reject(new Error("Cannot reach the server. Check that the bridge and server are running."))
        return
      }

      const timer = setTimeout(() => {
        pendingRequestsRef.current = pendingRequestsRef.current.filter((p) => p !== pendingRecord)
        reject(new Error("Server response timed out. Please try again."))
      }, timeoutMs)

      const pendingRecord = {
        requestType: payload.type,
        expectedType,
        resolve: (data) => {
          clearTimeout(timer)
          resolve(data)
        },
        reject: (err) => {
          clearTimeout(timer)
          reject(err)
        }
      }

      pendingRequestsRef.current.push(pendingRecord)
    })
  }, [send])

  // Subscribe to specific push or reply types
  const subscribe = useCallback((msgType, callback) => {
    if (!listenersRef.current.has(msgType)) {
      listenersRef.current.set(msgType, new Set())
    }
    listenersRef.current.get(msgType).add(callback)

    return () => {
      const set = listenersRef.current.get(msgType)
      if (set) {
        set.delete(callback)
        if (set.size === 0) listenersRef.current.delete(msgType)
      }
    }
  }, [])

  const retry = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    backoffDelayRef.current = 1000
    connect()
  }, [connect])

  return (
    <SocketContext.Provider
      value={{
        connectionStatus,
        send,
        request,
        subscribe,
        retry
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
