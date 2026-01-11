import { Routes, Route, Link } from "react-router-dom"
import Register from "./pages/Register"
import Scan from "./pages/Scan"
import Login from "./pages/Login"
import Landing from "./pages/Landing"
import Home from "./pages/Home"
import "./App.css"
import PublicRoute from "./components/PublicRoute"
import ProtectedRoute from "./components/ProtectedRoute"

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
                <Route
                    path="/"
                    element={
                    <PublicRoute>
                        <Landing />
                    </PublicRoute>
                    }
                />

                <Route
                    path="/login"
                    element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                    }
                />

                <Route
                    path="/register"
                    element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                    }
                />
                <Route
                    path="/scan"
                    element={
                    <ProtectedRoute>
                        <Scan />
                    </ProtectedRoute>
                    }
                />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                        <Home />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    )
}
