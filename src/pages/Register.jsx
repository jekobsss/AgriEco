import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getLogs, saveLogs } from "../utils/storage"
import logo from "../assets/logo.png"

export default function Register() {
    const [role, setRole] = useState("")
    const [firstName, setFirstName] = useState("")
    const [middleName, setMiddleName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [contact, setContact] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const userRegister = () => {
        if (
            role === "" ||
            !firstName.trim() ||
            !middleName.trim() ||
            !lastName.trim() ||
            !email.trim() ||
            !contact.trim() ||
            !password.trim()
        ) {
            alert("Please complete all required fields")
            return
        }

        // 📧 role-based email validation
        if (role === "student" && !email.endsWith("@edu.ph")) {
            alert("Students must use an @edu.ph email address")
            return
        }

        if (role === "visitor" && !email.endsWith("@gmail.com")) {
            alert("Visitors must use an @gmail.com email address")
            return
        }

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

        const logs = getLogs() || []

        const record = {
            id: crypto.randomUUID(),
            role,
            firstName,
            middleName,
            lastName,
            email,
            contact,
            password 
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
                    <h1>AgriEco Park Entry</h1>
                    <p>QR-based daily access system</p>
                </div>

                <div className="form-group drop-down">
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="visitor">Visitor</option>
                    </select>
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

                <div className="form-group">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>

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

                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="button"
                    className="primary-btn"
                    onClick={userRegister}
                >
                    Register
                </button>
            </div>
        </div>
    )
}
