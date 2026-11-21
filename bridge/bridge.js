// ─── IMPORTS ───────────────────────────────────────────────
// 'net' is Node's built-in module for raw TCP connections
const net = require("net")

// 'ws' is the package we installed — gives us a WebSocket server
const { WebSocketServer } = require("ws")

// ─── CONFIGURATION ─────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "8080", 10)
const PYTHON_HOST = process.env.PYTHON_HOST || "127.0.0.1"
const PYTHON_PORT = parseInt(process.env.PYTHON_PORT || "5000", 10)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.trim() : null

// ─── CREATE WEBSOCKET SERVER ────────────────────────────────
// React frontend will connect to this on PORT (default 8080 or cloud PORT)
const wss = new WebSocketServer({
    port: PORT,
    verifyClient: (info, callback) => {
        if (!ALLOWED_ORIGIN) {
            // Allow all origins when ALLOWED_ORIGIN is not configured
            return callback(true)
        }
        const reqOrigin = info.origin || (info.req && info.req.headers && info.req.headers.origin)
        // If an Origin header was provided and doesn't match ALLOWED_ORIGIN, reject
        if (reqOrigin && reqOrigin !== ALLOWED_ORIGIN) {
            console.log(`[Bridge] Rejected connection from unauthorized origin: ${reqOrigin} (allowed: ${ALLOWED_ORIGIN})`)
            return callback(false, 403, "Forbidden: Unauthorized Origin")
        }
        callback(true)
    }
})

console.log(`Bridge is running on port ${PORT}, forwarding to Python server on ${PYTHON_HOST}:${PYTHON_PORT}`)
if (ALLOWED_ORIGIN) {
    console.log(`Bridge origin restricted to: ${ALLOWED_ORIGIN}`)
}

// ─── WHEN A BROWSER (FRONTEND) CONNECTS ────────────────────
wss.on("connection", (ws) => {
    console.log("Frontend connected via WebSocket")

    // For every frontend connection, open a fresh TCP connection to Python
    const tcp = net.createConnection({ port: PYTHON_PORT, host: PYTHON_HOST }, () => {
        console.log(`TCP connection to Python server established (${PYTHON_HOST}:${PYTHON_PORT})`)
    })

    // Buffer to handle partial TCP messages
    let buffer = ""

    // ─── FRONTEND → PYTHON ──────────────────────────────────
    // When frontend sends a JSON message via WebSocket,
    // forward it to Python over TCP (add \n as the message delimiter)
    ws.on("message", (data) => {
        tcp.write(data.toString() + "\n")
    })

    // ─── PYTHON → FRONTEND ──────────────────────────────────
    // When Python sends data back over TCP,
    // split it on \n, extract complete messages, forward each to frontend
    tcp.on("data", (data) => {
        buffer += data.toString()

        const lines = buffer.split("\n")

        // last item might be incomplete — keep it in buffer for next time
        buffer = lines[lines.length - 1]

        // everything before the last item is a complete message
        const complete = lines.slice(0, -1)

        complete.forEach((line) => {
            // ws.readyState === 1 means WebSocket is still open
            if (line && ws.readyState === 1) {
                ws.send(line)   // send JSON string back to React
            }
        })
    })

    // ─── CLEANUP ────────────────────────────────────────────
    // If frontend disconnects, close the TCP connection to Python too
    ws.on("close", () => {
        console.log("Frontend disconnected — closing TCP connection")
        tcp.destroy()
    })

    // If Python server closes or crashes, close the WebSocket too
    tcp.on("close", () => {
        console.log("Python server closed connection")
        ws.close()
    })

    // If TCP hits an error (Python not running etc), close WebSocket cleanly
    tcp.on("error", (err) => {
        console.log("TCP error:", err.message)
        ws.close()
    })
})
