import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { postAuth } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";

interface LoginApiResponse {
  token: string;
  role?: "user" | "admin";
  userId?: string;
  tipo?: "user" | "admin";
  user?: {
    id: string;
    nome: string;
    email: string;
    role?: "user" | "admin";
    tipo?: "user" | "admin";
  };
}

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setIsLoading(true);

    try {
      const response = await postAuth<LoginApiResponse>("/admin/login", {
        email,
        senha,
      });

      const { token } = response.data;
      const role =
        response.data.role ??
        response.data.tipo ??
        response.data.user?.role ??
        response.data.user?.tipo;
      const userId = response.data.userId ?? response.data.user?.id;

      if (role !== "admin") {
        setErro("Apenas administradores podem acessar este painel.");
        return;
      }

      if (!userId) {
        setErro("Não foi possível identificar o usuário administrador.");
        return;
      }

      login({
        token,
        role,
        userId,
      });

      onClose();
      navigate("/admin", { replace: true });
    } catch {
      setErro("Email ou senha inválidos para acesso de administrador.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setEmail("");
    setSenha("");
    setErro("");
    setMostrarSenha(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm animate-[fadeIn_.3s_ease-out] rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Acesso de Administrador
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            Login Admin
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Faça login com suas credenciais de administrador.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              placeholder="admin@exemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="admin-senha"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="admin-senha"
                type={mostrarSenha ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {erro ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {erro}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar como Admin"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
