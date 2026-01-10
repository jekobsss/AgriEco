import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getLogs, saveLogs } from "../utils/storage"
import { supabase } from "../utils/supabase"
import logo from "../assets/logo.png"

export default function Register() {
    const [step, setStep] = useState(1) // Step 1: Role selection, Step 2: Form
    const [role, setRole] = useState("")
    const [firstName, setFirstName] = useState("")
    const [middleName, setMiddleName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [contact, setContact] = useState("")
    const [studentNumber, setStudentNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [emailExists, setEmailExists] = useState(false)

    const navigate = useNavigate()

    // Step 1: Handle role selection
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole)
        setStep(2)
    }

    // Check if email exists in database
    const checkEmailExists = async (emailToCheck) => {
        const { data } = await supabase
            .from('users')
            .select('email')
            .eq('email', emailToCheck)
            .single()

        setEmailExists(!!data)
    }

    // Handle email change
    const handleEmailChange = async (e) => {
        const newEmail = e.target.value
        setEmail(newEmail)

        // Only check if email is not empty and looks complete
        if (newEmail.trim()) {
            const fullCheckEmail = role === "student" 
                ? (newEmail.includes("@") ? newEmail : `${newEmail}@cvsu.edu.ph`)
                : newEmail

            await checkEmailExists(fullCheckEmail)
        } else {
            setEmailExists(false)
        }
    }

    // Step 2: Handle form submission
    const userRegister = async () => {
        // Validate common fields
        if (
            !firstName.trim() ||
            !middleName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !contact.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            alert("Please complete all required fields")
            return
        }

        // Validate student number only for students
        if (role === "student" && !studentNumber.trim()) {
            alert("Please enter your student number")
            return
        }

        // Append @cvsu.edu.ph to email for students only
        const fullEmail = role === "student" 
            ? (email.includes("@") ? email : `${email}@cvsu.edu.ph`)
            : email

        // 📱 contact number validation
        if (contact.length !== 11) {
            alert("Contact number must be exactly 11 digits")
            return
        }

        // 🔐 password validation
        if (password.length < 6) {
            alert("Password must be at least 6 characters")
            return
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match")
            return
        }

        const userId = crypto.randomUUID()
        const fullName = `${firstName} ${middleName} ${lastName}`
        const createdAt = new Date().toISOString()

        // � Check if email already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', fullEmail)
            .single()

        if (existingUser) {
            alert(`This email (${fullEmail}) is already registered. Please use a different email or try logging in.`)
            return
        }

        // �📤 Send to Supabase
        const { error } = await supabase
            .from('users')
            .insert([
                {
                    id: userId,
                    full_name: fullName,
                    email: fullEmail,
                    role,
                    student_number: studentNumber,
                    created_at: createdAt,
                    contact_num: contact,
                    password
                }
            ])

        if (error) {
            alert(`Registration failed: ${error.message}`)
            return
        }

        const logs = getLogs() || []

        const record = {
            id: userId,
            role,
            firstName,
            middleName,
            lastName,
            email: fullEmail,
            contact,
            studentNumber,
            password,
            created_at: createdAt
        }

        logs.push(record)
        saveLogs(logs)

        navigate("/home")
    }

    return (
        <div className="app-container">
            <div className="card">
                <div className="header">
                    <img src={logo} alt="AgriEco Logo" />
                    <h1>Register</h1>
                    <p>Create your Entry QR Code</p>
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

                {/* STEP 2: Registration Form */}
                {step === 2 && (
                    <>
                        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#1f7a3f",
                                    padding: "0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "color 0.2s ease",
                                    width: "32px",
                                    height: "32px"
                                }}
                                onMouseEnter={(e) => e.target.style.color = "#2fbf71"}
                                onMouseLeave={(e) => e.target.style.color = "#1f7a3f"}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M5 12l7-7M5 12l7 7" />
                                </svg>
                            </button>
                        </div>

                <div className="form-group">
                    <input
                        placeholder="Last Name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        placeholder="First Name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        placeholder="Middle Name"
                        value={middleName}
                        onChange={e => setMiddleName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group" style={{ position: "relative" }}>
                    <input
                        type="text"
                        placeholder={role === "student" ? "CvSU Email" : "Email"}
                        value={email}
                        onChange={handleEmailChange}
                        style={{
                            paddingRight: role === "student" ? "130px" : "0",
                            border: emailExists ? "2px solid #ff6b6b" : "1px solid #ddd",
                            boxShadow: emailExists ? "0 0 8px rgba(255, 107, 107, 0.4)" : "none"
                        }}
                        required
                    />
                    {role === "student" && (
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

                {emailExists && (
                    <p style={{ color: "#ff6b6b", fontSize: "0.85rem", margin: "-0.5rem 0 0.5rem 0" }}>
                        This email is already registered. Please use a different email.
                    </p>
                )}

                {role === "student" && (
                    <div className="form-group">
                        <input
                            placeholder="Student Number"
                            value={studentNumber}
                            onChange={e => setStudentNumber(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <input
                        type="tel"
                        placeholder="Contact Number"
                        value={contact}
                        onChange={e =>
                            setContact(e.target.value.replace(/\D/g, ""))
                        }
                        maxLength={11}
                        required
                    />
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

                <div className="form-group" style={{ position: "relative" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
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
                    onClick={userRegister}
                >
                    Register
                </button>
                    </>
                )}
            </div>
        </div>
    )
}
