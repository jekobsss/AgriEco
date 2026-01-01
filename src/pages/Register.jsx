import { useState } from "react"
import QRCode from "qrcode"
import { getLogs, saveLogs } from "../utils/storage"
import { todayString } from "../utils/date"

export default function Register() {
  const [fullName, setFullName] = useState("")
  const [contact, setContact] = useState("")
  const [qrImage, setQrImage] = useState(null)

  const generateQR = async () => {
    if (!fullName) {
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
    <div>
      <h1>AgriEco Park Entry</h1>

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />

      <input
        placeholder="Contact Number"
        value={contact}
        onChange={e => setContact(e.target.value)}
      />

      <button onClick={generateQR}>
        Generate QR Code
      </button>

      {qrImage && (
        <>
          <p>Valid only for today</p>
          <img src={qrImage} />
        </>
      )}
    </div>
  )
}
