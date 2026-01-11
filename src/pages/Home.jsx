import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import QRCode from "qrcode"
import { getLogs, saveLogs } from "../utils/storage"
import { supabase } from "../utils/supabase"
import logo from "../assets/logo.png"

// 🔧 CONFIG
const EXPIRY_HOUR = 24 // 12:00 AM
const EXPIRY_MINUTE = 0

// 🎯 Capitalize role for display
const capitalizeRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
}

// 📅 Format timestamp for display
const formatTimestamp = (iso) => {
    if (!iso) return ""
    const date = new Date(iso)
    return date.toLocaleString()
}

export default function Home() {
    const [user, setUser] = useState(null)
    const [qrUrl, setQrUrl] = useState("")
    const [timeLeft, setTimeLeft] = useState("")
    const [hasQrToday, setHasQrToday] = useState(false)
    const [createdAt, setCreatedAt] = useState("")
    const navigate = useNavigate()
    const [expiresAt, setExpiresAt] = useState(null)

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
        const init = async () => {
            const logs = getLogs()
            if (!logs || logs.length === 0) return

            const latestUser = logs[logs.length - 1]
            setUser(latestUser)

            const now = new Date().toISOString()

            const { data, error } = await supabase
                .from("qr_codes")
                .select("*")
                .eq("users_id", latestUser.id)
                .eq("is_active", true)
                .gt("expires_at", now)
                .single()

            if (data) {
                setHasQrToday(true)
                setQrUrl(data.qr_image)
                setCreatedAt(data.created_qr_at)
                setExpiresAt(data.expires_at)

                const expiry = new Date(data.expires_at)
                updateTimer(expiry)
                const interval = setInterval(() => updateTimer(expiry), 1000)
                return () => clearInterval(interval)
            }
        }

        init()
    }, [])

    // 🔘 GENERATE QR (ON BUTTON CLICK)
    const generateQr = async () => {
        const logs = getLogs()
        const latestUser = logs[logs.length - 1]

        const today = new Date().toDateString()
        const expiry = getTodayExpiry()
        const createdQrAt = new Date().toISOString()

        const qrPayload = { q: crypto.randomUUID().slice(0,8) }

        const qr = await QRCode.toDataURL(JSON.stringify(qrPayload))

        // 📤 Save QR code to Supabase
        const { error } = await supabase
            .from('qr_codes')
            .insert([
                {
                    id: crypto.randomUUID(),
                    users_id: latestUser.id,
                    qr_image: qr,
                    qr_payload: qrPayload,
                    created_qr_at: createdQrAt,
                    expires_at: expiry.toISOString(),
                    is_active: true
                }
            ])

        if (error) {
            console.error('Failed to save QR code to Supabase:', error)
            alert(`QR saved locally but Supabase error: ${error.message}`)
            // Continue anyway - still save to local storage
        } else {
            console.log('QR code successfully saved to Supabase!')
        }

        latestUser.qrData = qr
        latestUser.qrDate = today
        latestUser.created_qr_at = createdQrAt

        saveLogs(logs)

        setQrUrl(qr)
        setHasQrToday(true)
        setCreatedAt(new Date().toISOString())
        setExpiresAt(expiry.toISOString())

        updateTimer(expiry)
        const interval = setInterval(() => updateTimer(expiry), 1000)
        return () => clearInterval(interval)
    }

    // 🗑️ DELETE QR CODE
    const deleteQr = async () => {
        const confirmed = window.confirm("Are you sure you want to delete the QR code? You'll need to generate a new one.")
        if (!confirmed) return

        const logs = getLogs()
        const latestUser = logs[logs.length - 1]

        // 🗑️ Delete from Supabase qr_codes table
        const { error } = await supabase
            .from('qr_codes')
            .delete()
            .eq('users_id', latestUser.id)

        if (error) {
            console.error('Failed to delete QR from Supabase:', error)
        } else {
            console.log('QR code deleted from Supabase')
        }

        latestUser.qrData = null
        latestUser.qrDate = null
        latestUser.created_qr_at = null

        saveLogs(logs)

        setQrUrl("")
        setHasQrToday(false)
        setCreatedAt("")
        setTimeLeft("")
        setExpiresAt(null)
    }

    return (
        <div className="app-container">
            <div className="card">
                <div className="header">
                    <img src={logo} alt="AgriEco Logo" />
                    <h1>Your Entry QR Code</h1>
                    <p>
                    {hasQrToday && expiresAt
                        ? `Expires at ${new Date(expiresAt).toLocaleString()}`
                        : "No QR detected. Please generate one."}
                    </p>
                </div>

                {!user ? (
                    <p style={{ textAlign: "center" }}>No user found.</p>
                ) : (
                    <>
                        <div className="details">
                            <p>
                                <strong>Name:</strong>{" "}
                                {user.full_name || `${user.firstName} ${user.middleName} ${user.lastName}`}
                            </p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {capitalizeRole(user.role)}</p>
                            <p><strong>Contact Number:</strong> {user.contact_num || user.contact}</p>
                        </div>

                        {!hasQrToday && (
                            <>
                                <button
                                    className="primary-btn"
                                    style={{ marginTop: 20 }}
                                    onClick={generateQr}
                                >
                                    Generate QR
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        saveLogs([])
                                        navigate("/")
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "0.6rem 1.2rem",
                                        borderRadius: "8px",
                                        border: "1px solid #1f7a3f",
                                        background: "transparent",
                                        color: "#1f7a3f",
                                        fontSize: "0.9rem",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        marginTop: "10px"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#1f7a3f"
                                        e.target.style.color = "white"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "transparent"
                                        e.target.style.color = "#1f7a3f"
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        )}

                        {hasQrToday && (
                            <>
                                <p style={{ textAlign: "center", marginTop: 10 }}>
                                    Time left: <strong>{timeLeft}</strong>
                                </p>

                                {timeLeft !== "Expired" && (
                                    <div style={{ textAlign: "center", marginTop: 20 }}>
                                        <img src={qrUrl} alt="QR Code" width={220} />
                                        {createdAt && (
                                            <p style={{ fontSize: "0.85rem", color: "#888", marginTop: 8 }}>
                                                Generated at: {formatTimestamp(createdAt)}
                                            </p>
                                        )}
                                        <p style={{ fontSize: "0.9rem", color: "#555", marginTop: 12 }}>
                                            Take a photo of this QR Code to scan it later on
                                        </p>
                                        <div style={{ display: "flex", gap: "10px", marginTop: 12, justifyContent: "center" }}>
                                            <button
                                                type="button"
                                                onClick={deleteQr}
                                                style={{
                                                    padding: "0.6rem 1.2rem",
                                                    borderRadius: "8px",
                                                    border: "1px solid #ff6b6b",
                                                    background: "transparent",
                                                    color: "#ff6b6b",
                                                    fontSize: "0.9rem",
                                                    fontWeight: "500",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#ff6b6b"
                                                    e.target.style.color = "white"
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "transparent"
                                                    e.target.style.color = "#ff6b6b"
                                                }}
                                            >
                                                Delete QR
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    saveLogs([])
                                                    navigate("/")
                                                }}
                                                style={{
                                                    padding: "0.6rem 1.2rem",
                                                    borderRadius: "8px",
                                                    border: "1px solid #1f7a3f",
                                                    background: "transparent",
                                                    color: "#1f7a3f",
                                                    fontSize: "0.9rem",
                                                    fontWeight: "500",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#1f7a3f"
                                                    e.target.style.color = "white"
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "transparent"
                                                    e.target.style.color = "#1f7a3f"
                                                }}
                                            >
                                                Logout
                                            </button>
                                        </div>
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
