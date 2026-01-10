import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { getLogs, saveLogs } from "../utils/storage"
import logo from "../assets/logo.png"

// 🔧 CONFIG
const EXPIRY_HOUR = 24 // 12:00 AM
const EXPIRY_MINUTE = 0

export default function Home() {
    const [user, setUser] = useState(null)
    const [qrUrl, setQrUrl] = useState("")
    const [timeLeft, setTimeLeft] = useState("")
    const [hasQrToday, setHasQrToday] = useState(false)

    // 🕛 today’s expiry
    const getTodayExpiry = () => {
        const d = new Date()
        d.setHours(EXPIRY_HOUR, EXPIRY_MINUTE, 0, 0)
        return d
    }

    // ⏳ timer
    const updateTimer = expiry => {
        const now = new Date()
        const diff = expiry - now

        if (diff <= 0) {
            setTimeLeft("Expired")
            return
        }

        const h = Math.floor(diff / (1000 * 60 * 60))
        const m = Math.floor((diff / (1000 * 60)) % 60)
        const s = Math.floor((diff / 1000) % 60)

        setTimeLeft(`${h}h ${m}m ${s}s`)
    }

    useEffect(() => {
        const logs = getLogs()
        if (!Array.isArray(logs) || logs.length === 0) return

        const latestUser = logs[logs.length - 1]
        setUser(latestUser)

        const today = new Date().toDateString()
        const expiry = getTodayExpiry()

        if (latestUser.qrDate === today && latestUser.qrData) {
            setHasQrToday(true)
            setQrUrl(latestUser.qrData)
            updateTimer(expiry)
            const interval = setInterval(() => updateTimer(expiry), 1000)
            return () => clearInterval(interval)
        }
    }, [])

    // 🔘 GENERATE QR (ON BUTTON CLICK)
    const generateQr = async () => {
        const logs = getLogs()
        const latestUser = logs[logs.length - 1]

        const today = new Date().toDateString()
        const expiry = getTodayExpiry()

        const qrPayload = {
            id: latestUser.id,
            role: latestUser.role,
            firstName: latestUser.firstName,
            middleName: latestUser.middleName,
            lastName: latestUser.lastName,
            email: latestUser.email,
            contact: latestUser.contact,
            generatedOn: today,
            expiresAt: expiry.toISOString()
        }

        const qr = await QRCode.toDataURL(JSON.stringify(qrPayload))

        latestUser.qrData = qr
        latestUser.qrDate = today

        saveLogs(logs)

        setQrUrl(qr)
        setHasQrToday(true)

        updateTimer(expiry)
        const interval = setInterval(() => updateTimer(expiry), 1000)
        return () => clearInterval(interval)
    }

    return (
        <div className="app-container">
            <div className="card">
                <div className="header">
                    <img src={logo} alt="AgriEco Logo" />
                    <h1>Your Daily QR</h1>
                    <p>Expires at 12:00 AM</p>
                </div>

                {!user ? (
                    <p style={{ textAlign: "center" }}>No user found.</p>
                ) : (
                    <>
                        <div className="details">
                            <p><strong>Role:</strong> {user.role}</p>
                            <p>
                                <strong>Name:</strong>{" "}
                                {user.firstName} {user.middleName} {user.lastName}
                            </p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Contact:</strong> {user.contact}</p>
                        </div>

                        {!hasQrToday && (
                            <button
                                className="primary-btn"
                                style={{ marginTop: 20 }}
                                onClick={generateQr}
                            >
                                Generate QR
                            </button>
                        )}

                        {hasQrToday && (
                            <>
                                <p style={{ textAlign: "center", marginTop: 10 }}>
                                    ⏳ Time left: <strong>{timeLeft}</strong>
                                </p>

                                {timeLeft !== "Expired" && (
                                    <div style={{ textAlign: "center", marginTop: 20 }}>
                                        <img src={qrUrl} alt="QR Code" width={220} />
                                    </div>
                                )}

                                {timeLeft === "Expired" && (
                                    <p style={{ color: "red", textAlign: "center", marginTop: 20 }}>
                                        QR expired. Generate a new one tomorrow.
                                    </p>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
