import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export function ProtectedRoute({ children, requiredRole = "user" }: ProtectedRouteProps) {
  const { token, role } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "admin" && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
