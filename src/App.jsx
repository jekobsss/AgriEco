import { Routes, Route, Link } from "react-router-dom"
import Register from "./pages/Register"
import Scan from "./pages/Scan"
import "./App.css"

export default function App() {
    return (
        <>
            <nav>
                <Link to="/">Register</Link> |{" "}
                <Link to="/scan">Scan (Mock)</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/scan" element={<Scan />} />
            </Routes>
        </>
    )
}
