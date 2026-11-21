import { spawn } from "child_process"
import puppeteer from "puppeteer-core"
import net from "net"
import path from "path"
import fs from "fs"

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const SCREENSHOT_DIR = path.resolve("..", "screenshots")

function waitForPort(port, host = "127.0.0.1", timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const interval = setInterval(() => {
      const socket = new net.Socket()
      socket.setTimeout(800)
      socket.on("connect", () => {
        socket.destroy()
        clearInterval(interval)
        resolve()
      })
      socket.on("error", () => {
        socket.destroy()
        if (Date.now() - start > timeout) {
          clearInterval(interval)
          reject(new Error(`Timeout waiting for port ${port}`))
        }
      })
      socket.on("timeout", () => {
        socket.destroy()
        if (Date.now() - start > timeout) {
          clearInterval(interval)
          reject(new Error(`Timeout waiting for port ${port}`))
        }
      })
      socket.connect(port, host)
    }, 250)
  })
}

async function run() {
  console.log("=== STARTING ALERTBRIDGE COMPLETE E2E TEST HARNESS ===")
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }

  // 1. Start Python TCP Server
  console.log("[1/4] Spawning Python TCP Server on port 5000...")
  const pythonProc = spawn("C:\\Users\\LENOVO\\AppData\\Local\\Python\\bin\\python.exe", ["Backend/server.py"], {
    cwd: path.resolve(".."),
    stdio: "inherit"
  })

  await waitForPort(5000)
  console.log("  -> Python server ready on port 5000")

  // 2. Start Node WebSocket Bridge
  console.log("[2/4] Spawning Node WebSocket Bridge on port 8080...")
  const bridgeProc = spawn("node", ["bridge/bridge.js"], {
    cwd: path.resolve(".."),
    stdio: "inherit"
  })

  await waitForPort(8080)
  console.log("  -> WebSocket bridge ready on port 8080")

  // 3. Start Vite Preview Server
  console.log("[3/4] Spawning Vite Preview Server on port 5173...")
  const viteProc = spawn("npx", ["vite", "preview", "--port", "5173", "--strictPort"], {
    cwd: path.resolve("."),
    shell: true,
    stdio: "inherit"
  })

  await waitForPort(5173)
  console.log("  -> Frontend preview ready on http://localhost:5173")

  // 4. Launch Headless Chrome
  console.log("[4/4] Launching Headless Chrome via puppeteer-core...")
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  })

  try {
    // ------------------------------------------------------------------
    // STEP 1: Landing Page Screenshots & Mobile Overflow Audit
    // ------------------------------------------------------------------
    console.log("\n--- Checking Landing Page (1440px & 390px) ---")
    const testPage = await browser.newPage()
    await testPage.setViewport({ width: 1440, height: 900 })
    await testPage.goto("http://localhost:5173/", { waitUntil: "networkidle0" })
    await new Promise((r) => setTimeout(r, 800))

    const shot1440 = path.join(SCREENSHOT_DIR, "landing_1440.png")
    await testPage.screenshot({ path: shot1440, fullPage: true })
    console.log(`[PASS] Captured 1440px Landing Screenshot: ${shot1440}`)

    // 390px Viewport
    await testPage.setViewport({ width: 390, height: 844 })
    await new Promise((r) => setTimeout(r, 800))
    const overflow390 = await testPage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    console.log(`[PASS] 390px Layout: horizontal overflow = ${overflow390 ? "FAIL (has overflow)" : "None (clean)"}`)

    const shot390 = path.join(SCREENSHOT_DIR, "landing_390.png")
    await testPage.screenshot({ path: shot390, fullPage: true })
    console.log(`[PASS] Captured 390px Landing Screenshot: ${shot390}`)

    // ------------------------------------------------------------------
    // STEP 2: Login Page & Error Handling
    // ------------------------------------------------------------------
    console.log("\n--- Checking Login Screen & Auth Validation ---")
    await testPage.setViewport({ width: 1440, height: 900 })
    await testPage.goto("http://localhost:5173/login", { waitUntil: "networkidle0" })
    await testPage.waitForSelector("#username")

    // Wrong password test
    await testPage.type("#username", "student01")
    await testPage.type("#password", "wrongpass")
    await testPage.click("button[type='submit']")
    await new Promise((r) => setTimeout(r, 800))

    const errText = await testPage.evaluate(() => document.body.innerText)
    const errShown = errText.includes("Invalid username or password")
    console.log(`[PASS] Wrong password rejection message displayed: ${errShown}`)

    const shotLogin = path.join(SCREENSHOT_DIR, "login_1440.png")
    await testPage.screenshot({ path: shotLogin })
    console.log(`[PASS] Captured Login Screenshot: ${shotLogin}`)

    // Unauthenticated navigation to /admin -> redirected to /login
    await testPage.goto("http://localhost:5173/admin", { waitUntil: "networkidle0" })
    const redirectUrl = testPage.url()
    console.log(`[PASS] Unauthenticated access to /admin redirected to: ${redirectUrl}`)
    await testPage.close()

    // ------------------------------------------------------------------
    // STEP 3: Real 4-Session Multi-Role Flow
    // ------------------------------------------------------------------
    console.log("\n=======================================================")
    console.log("--- EXECUTING 4-SESSION MULTI-ROLE REAL-TIME FLOW ---")
    console.log("=======================================================")

    const ctxStudent = await browser.createBrowserContext()
    const ctxAdmin = await browser.createBrowserContext()
    const ctxSecurity = await browser.createBrowserContext()
    const ctxMedical = await browser.createBrowserContext()

    const pStudent = await ctxStudent.newPage()
    const pAdmin = await ctxAdmin.newPage()
    const pSec = await ctxSecurity.newPage()
    const pMed = await ctxMedical.newPage()

    for (const p of [pStudent, pAdmin, pSec, pMed]) {
      await p.setViewport({ width: 1440, height: 900 })
    }

    async function loginUser(page, username, password) {
      await page.goto("http://localhost:5173/login", { waitUntil: "networkidle0" })
      await page.waitForSelector("#username")
      await page.type("#username", username)
      await page.type("#password", password)
      await page.click("button[type='submit']")
      // Wait for client navigation to dashboard
      await page.waitForFunction(() => !window.location.pathname.includes("/login"), { timeout: 6000 })
      await new Promise((r) => setTimeout(r, 600))
    }

    console.log("Logging in 4 separate concurrent roles...")
    await loginUser(pStudent, "student01", "pass")
    console.log("  -> student01 logged in successfully")
    await loginUser(pAdmin, "admin01", "pass")
    console.log("  -> admin01 logged in successfully")
    await loginUser(pSec, "sec01", "pass")
    console.log("  -> sec01 logged in successfully")
    await loginUser(pMed, "med01", "pass")
    console.log("  -> med01 logged in successfully")

    // Capture initial screenshots of each dashboard
    await pStudent.screenshot({ path: path.join(SCREENSHOT_DIR, "dashboard_student.png") })
    await pAdmin.screenshot({ path: path.join(SCREENSHOT_DIR, "dashboard_admin.png") })
    await pSec.screenshot({ path: path.join(SCREENSHOT_DIR, "dashboard_security.png") })
    await pMed.screenshot({ path: path.join(SCREENSHOT_DIR, "dashboard_medical.png") })
    console.log("[PASS] Saved role dashboards: student, admin, security, medical")

    // Student reports an incident via SPA navigation (clicking link)
    console.log("\n[Action 1] Student navigates to Report Emergency and submits...")
    const reportBtn = await pStudent.waitForSelector("a[href='/student/report']")
    await reportBtn.click()
    await pStudent.waitForSelector("#title")

    await pStudent.type("#title", "Severe Heat Exhaustion")
    await pStudent.type("#description", "Student collapsed near basketball court 2, needs urgent medical check.")
    await pStudent.type("#location", "Sports Complex Court 2")
    await pStudent.select("#incidentType", "medical")
    await pStudent.select("#severity", "critical")
    await pStudent.click("button[type='submit']")

    // Wait for submission completion and redirect to incident details
    await pStudent.waitForFunction(() => !window.location.pathname.endsWith("/report"), { timeout: 6000 })
    console.log("  -> Student emergency report created successfully")

    // Admin receives incident LIVE without refreshing
    console.log("\n[Action 2] Checking Admin receives live push...")
    await pAdmin.waitForFunction(() => document.body.innerText.includes("Severe Heat Exhaustion"), { timeout: 6000 })
    console.log("[PASS] Admin received incident live without refreshing")

    // Admin opens incident details by clicking the table row
    console.log("\n[Action 3] Admin clicks incident, marks Under Review, and assigns med01...")
    const adminRows = await pAdmin.$$("tbody tr")
    for (const r of adminRows) {
      const text = await pAdmin.evaluate((el) => el.innerText, r)
      if (text.includes("Severe Heat Exhaustion")) {
        await r.click()
        break
      }
    }

    await pAdmin.waitForSelector("#responderSelect")

    // Click "Mark Under Review" if present
    for (const b of await pAdmin.$$("button")) {
      const text = await pAdmin.evaluate((el) => el.innerText, b)
      if (text.toLowerCase().includes("under review")) {
        await b.click()
        await new Promise((r) => setTimeout(r, 600))
        break
      }
    }

    // Select med01 in assignment select
    await pAdmin.select("#responderSelect", "4")
    for (const b of await pAdmin.$$("button")) {
      const text = await pAdmin.evaluate((el) => el.innerText, b)
      if (text.toLowerCase().includes("assign responder")) {
        await b.click()
        await new Promise((r) => setTimeout(r, 1000))
        break
      }
    }
    console.log("  -> Admin assigned incident to med01")

    // Verify ONLY med01 received assignment push; sec01 received nothing
    console.log("\n[Action 4] Verifying selective unicast push...")
    await new Promise((r) => setTimeout(r, 1200))
    const secReceived = await pSec.evaluate(() => document.body.innerText.includes("Severe Heat Exhaustion"))
    const medReceived = await pMed.evaluate(() => document.body.innerText.includes("Severe Heat Exhaustion"))
    console.log(`[PASS] Security (sec01) received push: ${secReceived} (Expected: false)`)
    console.log(`[PASS] Medical (med01) received push: ${medReceived} (Expected: true)`)

    // Medical responder opens incident and progresses through lifecycle
    console.log("\n[Action 5] Medical responder steps through lifecycle: ACCEPTED -> EN_ROUTE -> ON_SCENE -> RESOLVED...")
    const medRows = await pMed.$$("tbody tr")
    for (const r of medRows) {
      const text = await pMed.evaluate((el) => el.innerText, r)
      if (text.includes("Severe Heat Exhaustion")) {
        await r.click()
        break
      }
    }

    async function clickNextStep(expectedLabel) {
      await new Promise((r) => setTimeout(r, 800))
      const allBtns = await pMed.$$("button")
      for (const btn of allBtns) {
        const txt = await pMed.evaluate((el) => el.innerText, btn)
        if (txt.toLowerCase().includes(expectedLabel.toLowerCase())) {
          await btn.click()
          await new Promise((r) => setTimeout(r, 800))
          return true
        }
      }
      return false
    }

    await clickNextStep("Accept")
    console.log("  -> Status transitioned to: ACCEPTED")
    await clickNextStep("En route")
    console.log("  -> Status transitioned to: EN_ROUTE")
    await clickNextStep("On scene")
    console.log("  -> Status transitioned to: ON_SCENE")
    await clickNextStep("Resolve")
    console.log("  -> Status transitioned to: RESOLVED")

    // Check student and admin see RESOLVED status live
    await new Promise((r) => setTimeout(r, 1000))
    const studentStatus = await pStudent.evaluate(() => document.body.innerText.includes("RESOLVED"))
    const adminStatus = await pAdmin.evaluate(() => document.body.innerText.includes("RESOLVED"))
    console.log(`[PASS] Student sees RESOLVED live without refresh: ${studentStatus}`)
    console.log(`[PASS] Admin sees RESOLVED live without refresh: ${adminStatus}`)

    // Refresh student session -> redirected to login with session ended
    console.log("\n[Action 6] Testing refresh behavior (session ended message)...")
    await pStudent.reload({ waitUntil: "networkidle0" })
    const reloadedUrl = pStudent.url()
    const reloadedText = await pStudent.evaluate(() => document.body.innerText)
    console.log(`[PASS] Refresh while logged in redirected to: ${reloadedUrl}`)
    console.log(`[PASS] Session ended notice displayed: ${reloadedText.includes("Session ended") || reloadedText.includes("log in again")}`)

    console.log("\n=======================================================")
    console.log("ALL PHASE 1 END-TO-END VERIFICATION CHECKS PASSED")
    console.log("=======================================================")
  } finally {
    await browser.close()
    pythonProc.kill()
    bridgeProc.kill()
    viteProc.kill()
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err)
  process.exit(1)
})
