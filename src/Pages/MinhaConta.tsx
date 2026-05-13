import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";

interface MeResponse {
  user: {
    id: string;
    nome: string;
    email: string;
    role: "user" | "admin";
  };
}

export default function MinhaConta() {
  const [usuario, setUsuario] = useState<MeResponse["user"] | null>(null);
  const [status, setStatus] = useState("Validando sessão...");
  const [carregandoLogout, setCarregandoLogout] = useState(false);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get<MeResponse>("/auth/me")
      .then((res) => {
        setUsuario(res.data.user);
        setStatus("Sessão válida.");
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        setStatus("Não foi possível carregar os dados da conta.");
      });
  }, [logout, navigate, token]);

  async function handleLogout() {
    setCarregandoLogout(true);

    try {
      await api.post("/auth/logout");
    } catch {
      // O backend valida a sessao; a limpeza local sempre acontece.
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)]">
      <div className="w-full px-4 py-5 sm:px-6 md:px-8">
        <header className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-slate-100">
          <strong className="text-base font-black">Minha conta</strong>
          <Link to={usuario?.role === "admin" ? "/admin" : "/cliente"} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
            Voltar
          </Link>
        </header>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">{status}</p>

          {usuario ? (
            <div className="mt-4 space-y-2 text-slate-800">
              <p><strong>Nome:</strong> {usuario.nome}</p>
              <p><strong>Email:</strong> {usuario.email}</p>
              <p><strong>Role:</strong> {usuario.role}</p>
              <p><strong>ID:</strong> {usuario.id}</p>

              <button
                type="button"
                onClick={handleLogout}
                disabled={carregandoLogout}
                className="mt-4 rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregandoLogout ? "Saindo..." : "Logout"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}