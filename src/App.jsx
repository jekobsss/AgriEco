import { Routes, Route, Link } from "react-router-dom"
import Register from "./pages/Register"
import Scan from "./pages/Scan"
import Login from "./pages/Login"
import Landing from "./pages/Landing"
import Home from "./pages/Home"
import "./App.css"

export default function App() {
    return (
        <>
            <nav>
                <Link to="/">Landing</Link> |{" "}
                <Link to="/login">Login</Link> |{" "}
                <Link to="/register">Register</Link> |{" "}
                <Link to="/home">Home</Link> |{" "}
                <Link to="/scan">Scan (Mock)</Link>

            </nav>

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </>
    )
}
