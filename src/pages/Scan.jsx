import { useEffect, useState } from "react"
import { supabase } from "../utils/supabase"

export default function Scan() {
  const [result, setResult] = useState("Waiting for QR")
  const [status, setStatus] = useState("waiting")
  const [visitorCount, setVisitorCount] = useState(0)

  useEffect(() => {
    expireOldQRs()
    loadVisitorCount()

    const subscription = supabase
      .channel("public:scan_logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "scan_logs",
        },
        (payload) => {
          handleScan(payload.new.qr_payload)
          loadVisitorCount()   // recalc unique visitors
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const expireOldQRs = async () => {
    await fetch("https://eaadzfmkoennqcudmrks.supabase.co/functions/v1/expire_qr")
  }

  const loadVisitorCount = async () => {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("scan_logs")
      .select("qr_payload")
      .gte("scanned_at", today)

    if (error) return

    // Deduplicate QR codes
    const unique = new Set(data.map(row => row.qr_payload))
    setVisitorCount(unique.size)
  }

  const handleScan = async (payload) => {
    const { data: qrRecord, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("qr_payload", payload)
      .single()

    if (error || !qrRecord) {
      showResult("Invalid QR Code", "error")
      return
    }

    const now = new Date()
    const expiresAt = new Date(qrRecord.expires_at)

    if (!qrRecord.is_active || now > expiresAt) {
      showResult("QR Code Expired", "error")
      return
    }

    showResult("Entry Allowed", "success")
  }

  const showResult = (message, type) => {
    setResult(message)
    setStatus(type)

    setTimeout(() => {
      setResult("Waiting for QR")
      setStatus("waiting")
    }, 4000)
  }

  const getColor = () => {
    if (status === "success") return "#4ade80"
    if (status === "error") return "#f87171"
    return "#9ca3af"
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ marginBottom: "10px" }}>AgriEco Gate Scanner</h1>

      <h2 style={{ color: "#16a34a", marginBottom: "30px" }}>
        Visitors Today: {visitorCount}
      </h2>

      <div
        style={{
          display: "inline-block",
          padding: "60px 80px",
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          minWidth: "400px",
        }}
      >
        <h2 style={{ fontSize: "2.5rem", color: getColor() }}>{result}</h2>
        <p style={{ marginTop: "20px", color: "#6b7280" }}>
          Scan your QR code to enter
        </p>
      </div>
    </div>
  )
}
