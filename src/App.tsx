import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./Pages/home";
import Login from "./Pages/Login";
import Cadastro from "./Pages/Cadastro";
import Produto from "./Pages/Produto";
import MinhasInteracoes from "./Pages/MinhasInteracoes";
import Dashboard from "./Pages/Dashboard";
import GerenciamentoProdutos from "./Pages/GerenciamentoProdutos";
import AdminPropostas from "./Pages/AdminPropostas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cliente" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/produto/:id" element={<Produto />} />
        <Route path="/propostas" element={<MinhasInteracoes />} />
        
        {/* Rotas protegidas de admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/produtos"
          element={
            <ProtectedRoute requiredRole="admin">
              <GerenciamentoProdutos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/interacoes"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPropostas />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}