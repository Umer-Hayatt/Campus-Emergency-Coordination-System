const net = require("net")
const { WebSocketServer } = require("ws")

const PORT = parseInt(process.env.PORT || "8080", 10)
const PYTHON_HOST = process.env.PYTHON_HOST || "127.0.0.1"
const PYTHON_PORT = parseInt(process.env.PYTHON_PORT || "5000", 10)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.trim() : null

// Create WebSocket server for frontend connections
const wss = new WebSocketServer({
    port: PORT,
    verifyClient: (info, callback) => {
        if (!ALLOWED_ORIGIN) {
            return callback(true)
        }
        const reqOrigin = info.origin || (info.req && info.req.headers && info.req.headers.origin)
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

// Handle incoming frontend WebSocket connections
wss.on("connection", (ws) => {
    console.log("Frontend connected via WebSocket")

    // Open dedicated TCP socket connection to Python server
    const tcp = net.createConnection({ port: PYTHON_PORT, host: PYTHON_HOST }, () => {
        console.log(`TCP connection to Python server established (${PYTHON_HOST}:${PYTHON_PORT})`)
    })

    let buffer = ""

    // Forward WebSocket JSON message to Python over TCP with newline delimiter
    ws.on("message", (data) => {
        tcp.write(data.toString() + "\n")
    })

    // Receive TCP bytes from Python, parse on newline delimiter, forward to WebSocket
    tcp.on("data", (data) => {
        buffer += data.toString()

        const lines = buffer.split("\n")
        buffer = lines[lines.length - 1]
        const complete = lines.slice(0, -1)

        complete.forEach((line) => {
            if (line && ws.readyState === 1) {
                ws.send(line)
            }
        })
    })

    // Clean up TCP connection when WebSocket disconnects
    ws.on("close", () => {
        console.log("Frontend disconnected — closing TCP connection")
        tcp.destroy()
    })

    // Close WebSocket if Python TCP connection drops
    tcp.on("close", () => {
        console.log("Python server closed connection")
        ws.close()
    })

    // Handle TCP connection errors gracefully
    tcp.on("error", (err) => {
        console.log("TCP error:", err.message)
        ws.close()
    })
})
