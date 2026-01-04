import { useState } from "react"
import QRCode from "qrcode"
import { getLogs, saveLogs } from "../utils/storage"
import { todayString } from "../utils/date"
import logo from "../assets/logo.png"

export default function Register() {
    const [fullName, setFullName] = useState("")
    const [contact, setContact] = useState("")
    const [qrImage, setQrImage] = useState(null)

    const generateQR = async () => {
        if (!fullName.trim()) {
            alert("Name is required")
            return
        }

        const logs = getLogs()
        const token = crypto.randomUUID()

        const record = {
            id: crypto.randomUUID(),
            fullName,
            contact,
            visitDate: todayString(),
            qrToken: token,
            isCheckedIn: false,
            checkInTime: null
        }

        logs.push(record)
        saveLogs(logs)

        const qrPayload = JSON.stringify({ token })
        const qr = await QRCode.toDataURL(qrPayload)

        setQrImage(qr)
    }

    return (
        <div className="app-container">
            <div className="card">
                <div className="header">
                    <img src={logo} alt="AgriEco Logo" />
                    <h1>AgriEco Park Entry</h1>
                    <p>QR-based daily access system</p>
                </div>

                <div className="form-group">
                    <input
                        placeholder="Full Name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <input
                        placeholder="Contact Number"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                    />
                </div>

                <button
                    className="primary-btn"
                    onClick={generateQR}
                >
                    Generate QR
                </button>

                {qrImage && (
                    <div className="qr-container">
                        <img src={qrImage} alt="QR Code" />
                        <p>Valid for today only</p>
                    </div>
                )}
            </div>
        </div>
    )
}
