// App.jsx - Router setup only
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RankingPage from "./pages/RankingPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navbar />
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <ProtectedRoute>
              <Navbar />
              <RankingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/players"
          element={
            <ProtectedRoute>
              <Navbar />
              <PlayersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/players/:id"
          element={
            <ProtectedRoute>
              <Navbar />
              <PlayerDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
