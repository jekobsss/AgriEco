import { useState } from "react"
import { getLogs, saveLogs } from "../utils/storage"
import { useNavigate } from "react-router-dom"
import { supabase } from "../utils/supabase"
import logo from "../assets/logo.png"

export default function Login() {
    const [step, setStep] = useState(1) // Step 1: Role selection, Step 2: Login form
    const [role, setRole] = useState("")
    const [identifier, setIdentifier] = useState("") // Email or Student Number
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loginMethod, setLoginMethod] = useState("email") // "email" or "studentNumber"
    const navigate = useNavigate()

    // Step 1: Handle role selection
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole)
        setStep(2)
    }

    const login = async () => {
        if (!identifier.trim() || !password.trim()) {
            alert("Please fill in all fields")
            return
        }

        try {
            let fullEmail = ""
            let studentNumber = ""

            if (role === "student") {
                if (loginMethod === "email") {
                    fullEmail = identifier.includes("@") ? identifier : `${identifier}@cvsu.edu.ph`
                } else {
                    studentNumber = identifier
                }
            } else {
                fullEmail = identifier
            }

            // 🔍 Check Supabase first
            let query = supabase.from('users').select('*').eq('password', password)

            if (studentNumber) {
                query = query.eq('student_number', studentNumber)
            } else {
                query = query.eq('email', fullEmail)
            }

            const { data, error } = await query.single()

            if (error && error.code !== 'PGRST116') {
                alert(`Login failed: ${error.message}`)
                return
            }

            if (data) {
                // Found user in Supabase, save to local storage for quick access
                const logs = getLogs() || []
                const localUser = logs.find(user => user.email === data.email)
                
                if (!localUser) {
                    logs.push({
                        id: data.id,
                        full_name: data.full_name,
                        email: data.email,
                        role: data.role,
                        student_number: data.student_number,
                        created_at: data.created_at,
                        contact_num: data.contact_num,
                        password: data.password
                    })
                    saveLogs(logs)
                }

                navigate("/home")
                return
            }

            // Fallback: Check local storage
            const logs = getLogs()

            if (!Array.isArray(logs) || logs.length === 0) {
                alert("Invalid credentials")
                return
            }

            let existingUser = null
            if (studentNumber) {
                existingUser = logs.find(
                    user =>
                        user.student_number === studentNumber &&
                        user.password &&
                        user.password === password
                )
            } else {
                existingUser = logs.find(
                    user =>
                        user.email === fullEmail &&
                        user.password &&
                        user.password === password
                )
            }

            if (!existingUser) {
                alert("Invalid credentials")
                return
            }

            navigate("/home")
        } catch (error) {
            alert(`Error: ${error.message}`)
        }
    }

    return (
        <div className="app-container">
            <div className="card">
                <div className="header">
                    <img src={logo} alt="AgriEco Logo" />
                    <h1>Login</h1>
                    <p>Login to an existing account</p>
                </div>

                {/* STEP 1: Role Selection */}
                {step === 1 && (
                    <>
                        <p style={{ textAlign: "center", marginBottom: "2rem", fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>
                            Are you a Student or Visitor?
                        </p>
                        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("student")}
                                style={{
                                    flex: 1,
                                    padding: "1rem",
                                    borderRadius: "12px",
                                    border: "2px solid #1f7a3f",
                                    background: "transparent",
                                    color: "#1f7a3f",
                                    fontSize: "1rem",
                                    fontWeight: "600",
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
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("visitor")}
                                style={{
                                    flex: 1,
                                    padding: "1rem",
                                    borderRadius: "12px",
                                    border: "2px solid #1f7a3f",
                                    background: "transparent",
                                    color: "#1f7a3f",
                                    fontSize: "1rem",
                                    fontWeight: "600",
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
                                Visitor
                            </button>
                        </div>
                        <p
                            onClick={() => navigate("/")}
                            style={{
                                marginTop: "0.75rem",
                                textAlign: "center",
                                color: "#1f7a3f",
                                cursor: "pointer",
                                fontSize: "0.9rem"
                            }}
                        >
                            Return
                        </p>
                    </>
                )}

                {/* STEP 2: Login Form */}
                {step === 2 && (
                    <>
                        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1)
                                    setIdentifier("")
                                    setPassword("")
                                    setLoginMethod("email")
                                }}
                                style={{
                                    padding: "0.5rem 0.75rem",
                                    borderRadius: "8px",
                                    border: "1px solid #1f7a3f",
                                    background: "transparent",
                                    color: "#1f7a3f",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
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
                                ← Back
                            </button>
                        </div>

                        {/* For Student: Show login method selection */}
                        {role === "student" && (
                            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginMethod("email")
                                        setIdentifier("")
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "0.6rem",
                                        borderRadius: "8px",
                                        border: loginMethod === "email" ? "2px solid #1f7a3f" : "1px solid #ddd",
                                        background: loginMethod === "email" ? "#1f7a3f" : "transparent",
                                        color: loginMethod === "email" ? "white" : "#555",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginMethod("studentNumber")
                                        setIdentifier("")
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "0.6rem",
                                        borderRadius: "8px",
                                        border: loginMethod === "studentNumber" ? "2px solid #1f7a3f" : "1px solid #ddd",
                                        background: loginMethod === "studentNumber" ? "#1f7a3f" : "transparent",
                                        color: loginMethod === "studentNumber" ? "white" : "#555",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    Student Number
                                </button>
                            </div>
                        )}

                        <div className="form-group" style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder={
                                    role === "student"
                                        ? loginMethod === "email"
                                            ? "CvSU Email"
                                            : "Student Number"
                                        : "Email"
                                }
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                style={{
                                    paddingRight: role === "student" && loginMethod === "email" ? "130px" : "0.9rem"
                                }}
                                required
                            />
                            {role === "student" && loginMethod === "email" && (
                                <span style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#888",
                                    fontSize: "0.95rem",
                                    pointerEvents: "none",
                                    fontWeight: "500"
                                }}>
                                    @cvsu.edu.ph
                                </span>
                            )}
                        </div>

                        <div className="form-group" style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ paddingRight: "70px" }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "8px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "transparent",
                                    border: "none",
                                    color: "#1f7a3f",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    padding: "6px 12px",
                                    transition: "all 0.2s ease",
                                    userSelect: "none"
                                }}
                                onMouseEnter={(e) => e.target.style.color = "#2fbf71"}
                                onMouseLeave={(e) => e.target.style.color = "#1f7a3f"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <button
                            type="button"
                            className="primary-btn"
                            onClick={login}
                        >
                            Login
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
