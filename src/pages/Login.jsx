import { useState } from "react"
import { getLogs } from "../utils/storage"
import { useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const login = () => {
        if (!email.trim() || !password.trim()) {
            alert("Email and password are required")
            return
        }

        const logs = getLogs()

        if (!Array.isArray(logs) || logs.length === 0) {
            alert("No registered users found")
            return
        }

        const existingUser = logs.find(
            user =>
                user.email === email &&
                user.password &&
                user.password === password
        )

        if (!existingUser) {
            alert("Invalid email or password")
            return
        }

        navigate("/home")
    }

    return (
        <div className="app-container">
            <div className="card">
                <div className="header">
                    <img src={logo} alt="AgriEco Logo" />
                    <h1>Login</h1>
                    <p>QR-based daily access system</p>
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
                    onClick={login}
                >
                    Login
                </button>
            </div>
        </div>
    )
}
