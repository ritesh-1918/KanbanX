import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App"; // Import App if needed or remove depending on structure, request replaces App in render
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BoardPage from "./pages/BoardPage";
import SharedBoardPage from "./pages/SharedBoardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/share/:shareId" element={<SharedBoardPage />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/board/:id"
                element={
                    <ProtectedRoute>
                        <BoardPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    </BrowserRouter>
);
