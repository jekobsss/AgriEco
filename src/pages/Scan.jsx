import { useState } from "react"
import { getLogs, saveLogs } from "../utils/storage"
import { todayString } from "../utils/date"

export default function Scan() {
    const [token, setToken] = useState("")
    const [result, setResult] = useState(null)

    const scanQR = () => {
        const logs = getLogs()
        const record = logs.find(r => r.qrToken === token)

        if (!record) {
            setResult("Invalid QR Code")
            return
        }

        if (record.visitDate !== todayString()) {
            setResult("QR Code Expired")
            return
        }

        if (record.isCheckedIn) {
            setResult("QR Code Already Used")
            return
        }

        record.isCheckedIn = true
        record.checkInTime = new Date().toISOString()
        saveLogs(logs)

        setResult("Entry Allowed")
    }

    return (
        <div>
            <h1>AgriEco Gate Scanner (Mock)</h1>

            <input
                placeholder="Paste QR token"
                value={token}
                onChange={e => setToken(e.target.value)}
            />

            <button onClick={scanQR}>Scan</button>

            {result && <h3>{result}</h3>}
        </div>
    )
}
