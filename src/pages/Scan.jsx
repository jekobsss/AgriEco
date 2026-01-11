import { useEffect, useState } from "react"
import { supabase } from "../utils/supabase"

export default function Scan() {
  const [result, setResult] = useState("Waiting for QR")
  const [status, setStatus] = useState("waiting") // waiting | success | error

useEffect(() => {
  // Expire old QR codes on page load
  fetch("https://eaadzfmkoennqcudmrks.supabase.co/functions/v1/expire_qr")
    .then(res => res.json())
    .then(data => console.log("Expired QR codes:", data))
    .catch(err => console.error("Failed to expire QR codes:", err))

  // Subscribe to new inserts on scan_logs
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
      }
    )
    .subscribe()

  // Cleanup subscription on unmount
  return () => {
    supabase.removeChannel(subscription)
  }
}, [])


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

    // Optional: Deactivate QR after successful scan
    // await supabase
    //   .from("qr_codes")
    //   .update({ is_active: false })
    //   .eq("qr_payload", payload)
  }

  const showResult = (message, type) => {
    setResult(message)
    setStatus(type)

    setTimeout(() => {
      setResult("Waiting for QR")
      setStatus("waiting")
    }, 5000)
  }

  const getColor = () => {
    if (status === "success") return "#4ade80" // green
    if (status === "error") return "#f87171" // red
    return "#9ca3af" // gray
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ marginBottom: "40px" }}>AgriEco Gate Scanner</h1>
      <div
        style={{
          display: "inline-block",
          padding: "40px 60px",
          borderRadius: "15px",
          backgroundColor: "#ffffff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ color: getColor(), fontSize: "2rem" }}>{result}</h2>
      </div>
      <p style={{ marginTop: "20px", color: "#6b7280" }}>
        Scan your QR code to check in
      </p>
    </div>
  )
}
