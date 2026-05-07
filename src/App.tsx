import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Pages/home";
import Login from "./Pages/Login";
import Cadastro from "./Pages/Cadastro";
import Produto from "./Pages/Produto";
import MinhasInteracoes from "./Pages/MinhasInteracoes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/produto/:id" element={<Produto />} />
        <Route path="/propostas" element={<MinhasInteracoes />} />
        <Route path="/admin" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}