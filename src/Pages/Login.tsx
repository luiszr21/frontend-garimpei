import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { postAuth } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";
import AdminLoginModal from "../components/AdminLoginModal";

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setErrosCampo({});
    setIsLoading(true);

    try {
      const response = await postAuth<LoginApiResponse>("/login", {
        email,
        senha,
      });

      const { token } = response.data;
      const role =
        response.data.role ??
        response.data.tipo ??
        response.data.user?.role ??
        response.data.user?.tipo ??
        "user";
      const userId = response.data.userId ?? response.data.user?.id;

      if (!userId) {
        setErro("Não foi possível identificar o usuário logado.");
        return;
      }

      login({
        token,
        role,
        userId,
      });
      
      navigate(role === "admin" ? "/admin" : "/cliente", { replace: true });
    } catch {
      setErro("Email ou senha inválidos.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#12102bd0]
 px-4 py-8 md:px-8">
  <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />

  <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />



      <div className="relative mx-auto grid min-h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur md:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-slate-900 p-10 text-slate-100 md:flex">
          <div>
        
            <h1 className="mt-5 text-4xl font-black leading-tight">
              GARIMPEI
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Cada achado tem uma história. Qual será o seu?
            </p>
          </div>
        </aside>

        <section className="flex items-center p-6 sm:p-8 md:p-10">
          <div className="w-full animate-[fadeIn_.45s_ease-out]">
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Bem-vindo ao Garimpei
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Faça login para continuar no painel.
            </p>

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="voce@exemplo.com"
                />
                {errosCampo.email ? (
                  <p className="mt-1 text-sm text-rose-700">{errosCampo.email}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
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
                className="h-12 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Ainda não tem conta?{" "}
              <button
                type="button"
                onClick={() => navigate("/cadastro")}
                className="font-semibold text-blue-700 transition hover:text-cyan-600 cursor-pointer"
              >
                Criar conta
              </button>
            </p>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-center text-sm text-slate-600">
                É administrador?{" "}
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="font-semibold text-blue-700 transition hover:text-blue-600 cursor-pointer" 
                >
                  Entrar como admin
                </button >
              </p>
            </div> 
          </div> 
          <div className="mt-10 text-center flex justify-center">
            <button 
      onClick={() => navigate("/home")}
      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
    >
      Ver roupas
    </button>
    </div>
        </section>
      </div>
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>

    
  );
}
