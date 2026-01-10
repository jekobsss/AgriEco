import logo from "../assets/logo.png"
import { useNavigate } from "react-router-dom"


export default function Register() {
    const navigate = useNavigate()

    return (
        <div className="app-container">
            <div className="card">
                <div className="header">
                    <img src={logo} alt="AgriEco Logo" />
                    <h1>AgriEco Park Entry</h1>
                    <p>QR-based daily access system</p>
                </div>

                <button
                    type="button"
                    className="primary-btn"
                    onClick={() => navigate("/login")}
                >
                    Login
                </button>

                <button
                    type="button"
                    className="primary-btn"
                    onClick={() => navigate("/register")}
                >
                    Signup
                </button>

            </div>
        </div>
    )
}
