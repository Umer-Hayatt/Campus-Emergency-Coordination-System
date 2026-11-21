// ─── IMPORTS ───────────────────────────────────────────────
// 'net' is Node's built-in module for raw TCP connections
const net = require("net")

// 'ws' is the package we installed — gives us a WebSocket server
const { WebSocketServer } = require("ws")


// ─── CREATE WEBSOCKET SERVER ────────────────────────────────
// React frontend will connect to this on port 8080
// (browser can't do raw TCP, so we give it WebSocket)
const wss = new WebSocketServer({ port: 8080 })

console.log("Bridge is running on port 8080")


// ─── WHEN A BROWSER (FRONTEND) CONNECTS ────────────────────
// 'ws' here is the WebSocket connection to that one browser tab
wss.on("connection", (ws) => {
    console.log("Frontend connected via WebSocket")

    // For every frontend connection, open a fresh TCP connection to Python
    // Python server is running on the same machine, port 5000
    const tcp = net.createConnection({ port: 5000, host: "127.0.0.1" }, () => {
        console.log("TCP connection to Python server established")
    })

    // Buffer to handle partial TCP messages (same reason as Python side)
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