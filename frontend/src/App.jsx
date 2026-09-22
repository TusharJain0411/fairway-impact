import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Subscribe from "./pages/Subscribe";
import Register from "./pages/Register";
import Charities from "./pages/Charities";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import Scores from "./pages/Dashboard-components/Scores";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import MyCharity from "./pages/Dashboard-components/MyCharity";
import Winnings from "./pages/Dashboard-components/Winnings";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminCharities from "./pages/Admin/AdminCharities";
import AdminDraws from "./pages/Admin/AdminDraws";
import AdminWinners from "./pages/Admin/AdminWinners";
import SuccessPage from "./pages/SuccessPage";
import NotFound from "./pages/NotFound";
import { Suspense } from "react";
import { LoadingState } from "./components/Common/PageStates";
import ProtectedRoute from "./components/Common/ProtectedRoute"

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCurrentUser } from "./features/auth/authSlice";

import "./styles/index.css";

function App() {

    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
      if (token) {
        dispatch(loadCurrentUser());
      }
    }, [dispatch, token]);

  return (
    
      <Suspense fallback={<LoadingState text="Loading page..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="scores" element={<Scores />} />
              <Route path="my-charity" element={<MyCharity />} />
              <Route path="winnings" element={<Winnings />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="charities" element={<AdminCharities />} />
              <Route path="draws" element={<AdminDraws />} />
              <Route path="winners" element={<AdminWinners />} />
            </Route>
          </Route>

          <Route path="/register-success" element={<SuccessPage />} />
          <Route path="/payment-success" element={<SuccessPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    
  );
}

export default App;
