import { useState } from "react";
import { postAuth } from "../Services/Api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface RequisitoDeSenha {
  id: string;
  descricao: string;
  validado: boolean;
}

export default function Cadastro() {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [senhaRequisitos, setSenhaRequisitos] = useState<RequisitoDeSenha[]>([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

  const navigate = useNavigate();

  // Validar requisitos da senha em tempo real
  const validarRequisitos = (senhaDigitada: string) => {
    const requisitos: RequisitoDeSenha[] = [
      {
        id: "minimo6",
        descricao: "Mínimo de 6 caracteres",
        validado: senhaDigitada.length >= 6,
      },
      {
        id: "maiuscula",
        descricao: "Pelo menos uma letra maiúscula",
        validado: /[A-Z]/.test(senhaDigitada),
      },
      {
        id: "minuscula",
        descricao: "Pelo menos uma letra minúscula",
        validado: /[a-z]/.test(senhaDigitada),
      },
      {
        id: "numero",
        descricao: "Pelo menos um número",
        validado: /[0-9]/.test(senhaDigitada),
      },
      {
        id: "especial",
        descricao: "Pelo menos um caractere especial (!@#$%^&*)",
        validado: /[!@#$%^&*]/.test(senhaDigitada),
      },
    ];

    setSenhaRequisitos(requisitos);
  };

  async function handleCadastro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setErrosCampo({});

    const nome = nomeUsuario.trim();

    if (!nome) {
      setErro("Informe um nome de usuário.");
      return;
    }

    // Validação: confirmação de senha
    if (senha !== confirmacaoSenha) {
      setErro("A confirmação de senha não corresponde à senha digitada.");
      return;
    }

    // Validação: comprimento mínimo da senha
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const email = identificador.trim();
    if (!email) {
      setErro("Informe um email válido.");
      return;
    }

    const nomeBase = email.split("@")[0];

    setIsLoading(true);

    try {
      await postAuth("/cadastro", {
        nome: nomeBase,
        email,
        senha,
      });

      // ✅ Cadastro bem-sucedido
      setSucesso("Cadastro realizado com sucesso! Redirecionando para o login...");
      
      // Limpar localStorage de qualquer sessão anterior
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");

      // Redirecionar para login após 1.5s
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error: unknown) {
      // Tratamento de erros seguindo boas práticas de segurança
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const responseData = error.response?.data as Record<string, unknown>;

        // Erros específicos do backend
        if (statusCode === 400) {
          // Email já registrado ou validação de entrada
          const mensagem = responseData?.erro || responseData?.message;
          if (typeof mensagem === "string") {
            // Mensagens específicas do backend
            if (mensagem.includes("email")) {
              setErro("Este email já está registrado. Tente fazer login ou use outro email.");
            } else if (mensagem.includes("senha")) {
              setErro("A senha não atende aos requisitos. Verifique as exigências abaixo.");
              // Se o backend retornar requisitos específicos, mostrar
              if (Array.isArray(responseData?.senhaRequisitos)) {
                const requisitosDoBackend = (responseData.senhaRequisitos as Array<string | Record<string, unknown>>).map(
                  (req) => ({
                    id: typeof req === "string" ? req : String(req.id ?? ""),
                    descricao: typeof req === "string" ? req : String(req.descricao ?? ""),
                    validado: false,
                  })
                );
                setSenhaRequisitos(requisitosDoBackend);
              }
            } else {
              setErro("Verifique seus dados e tente novamente.");
            }
          } else {
            setErro("Verifique seus dados e tente novamente.");
          }
        } else if (statusCode === 409) {
          // Conflito - email duplicado
          setErro("Este email já está registrado. Tente fazer login ou use outro email.");
        } else if (statusCode === 500) {
          // Erro no servidor
          setErro("Erro ao processar seu cadastro. Tente novamente em alguns momentos.");
        } else if (statusCode === 0 || !statusCode) {
          // Erro de conexão
          setErro("Falha ao conectar ao servidor. Verifique sua conexão com a internet.");
        } else {
          // Outros erros HTTP
          setErro("Não foi possível completar o cadastro. Tente novamente.");
        }
      } else if (error instanceof Error) {
        // Erro genérico
        setErro("Erro ao cadastrar. Tente novamente.");
      } else {
        setErro("Erro desconhecido. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)] px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />

      <div className="relative mx-auto grid min-h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur md:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-slate-900 p-10 text-slate-100 md:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
              Front Roupas
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight">
              Crie sua conta e inicie suas negociações.
            </h1>
          </div>
        </aside>

        <section className="flex items-center p-6 sm:p-8 md:p-10">
          <div className="w-full">
            <h2 className="text-3xl font-black text-slate-900">
              Criar conta
            </h2>

            <form onSubmit={handleCadastro} className="mt-7 space-y-4">
              <input
                type="text"
                required
                value={nomeUsuario}
                onChange={(e) => setNomeUsuario(e.target.value)}
                placeholder="Nome de usuário"
                className="h-12 w-full rounded-xl border px-4"
              />
              {errosCampo.nome ? (
                <p className="text-red-500 text-sm">{errosCampo.nome}</p>
              ) : null}

              <input
                type="email"
                required
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="email@exemplo.com"
                className="h-12 w-full rounded-xl border px-4"
              />
              {errosCampo.email ? (
                <p className="text-red-500 text-sm">{errosCampo.email}</p>
              ) : null}

              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    validarRequisitos(e.target.value);
                  }}
                  placeholder="Senha"
                  className="h-12 w-full rounded-xl border px-4 pr-12"
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

              {senhaRequisitos.length > 0 && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Requisitos da senha:
                  </p>
                  {senhaRequisitos.map((req) => (
                    <div key={req.id} className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          req.validado ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {req.validado ? "✓" : "✗"}
                      </span>
                      <span
                        className={`text-sm ${
                          req.validado ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {req.descricao}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <input
                  type={mostrarConfirmacaoSenha ? "text" : "password"}
                  required
                  value={confirmacaoSenha}
                  onChange={(e) => setConfirmacaoSenha(e.target.value)}
                  placeholder="Confirmar senha"
                  className="h-12 w-full rounded-xl border px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacaoSenha(!mostrarConfirmacaoSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  title={mostrarConfirmacaoSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarConfirmacaoSenha ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {erro && (
                <p className="text-red-500 text-sm">{erro}</p>
              )}

              {sucesso && (
                <p className="text-green-600 text-sm font-semibold">{sucesso}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || sucesso !== ""}
                className="h-12 w-full bg-black text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? "Cadastrando..." : "Criar conta"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full rounded-xl text-slate-700 transition duration-200 hover:text-blue-600"
              >
                Já tenho conta, voltar ao login
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}