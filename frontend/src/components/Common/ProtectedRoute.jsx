import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingState } from "./PageStates";

function ProtectedRoute({ adminOnly = false }) {
  const { user, isAuthenticated, isCheckingSession } = useSelector(
    (state) => state.auth,
  );

  if (isCheckingSession) {
    return <LoadingState text="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
