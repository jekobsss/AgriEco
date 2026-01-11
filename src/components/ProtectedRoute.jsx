import { Navigate } from "react-router-dom"
import { getLogs } from "../utils/storage"

export default function ProtectedRoute({ children }) {
    const logs = getLogs()
    const user = logs?.[logs.length - 1]

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}
