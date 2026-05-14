import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";
import type { Produto as ProdutoType } from "../types/produto";
// import types trimmed - payload sent directly
import axios from "axios";

export default function Produto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [produto, setProduto] = useState<ProdutoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isEnviandoProposta, setIsEnviandoProposta] = useState(false);
  const [propostaPendente] = useState(false);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // Buscar detalhes do produto
  useEffect(() => {
    if (!id) return;

    api
      .get<ProdutoType>(`/produtos/${id}`)
      .then((res) => {
        setProduto(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setErro("Produto não encontrado.");
        } else {
          setErro("Erro ao carregar o produto.");
        }
        setIsLoading(false);
      });
  }, [id]);

  async function handleEnviarProposta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!mensagem.trim()) {
      setErro("A mensagem não pode estar vazia.");
      return;
    }

    if (!produto) {
      setErro("Produto não carregado.");
      return;
    }

    setIsEnviandoProposta(true);

    try {
      const payload = {
        produtoId: produto.id,
        mensagem: mensagem.trim(),
      };

      // Enviar proposta para o backend (token via interceptor)
      await api.post("/propostas", payload);

      // Notificar outras telas e redirecionar para minhas propostas
      window.dispatchEvent(new CustomEvent("propostas:updated"));
      navigate("/propostas", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        if (statusCode === 400) {
          setErro("Dados inválidos. Tente novamente.");
        } else if (statusCode === 401) {
          setErro("Sessão expirada. Faça login novamente.");
          navigate("/login", { replace: true });
        } else if (statusCode === 409) {
          setErro("Você já enviou uma proposta para este produto.");
        } else {
          setErro("Erro ao enviar proposta. Tente novamente.");
        }
      } else {
        setErro("Erro desconhecido. Tente novamente.");
      }
    } finally {
      setIsEnviandoProposta(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)] flex items-center justify-center">
        <p className="text-slate-600">Carregando produto...</p>
      </div>
    );
  }

  if (erro && !produto) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)] flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-semibold">{erro}</p>
        <Link
          to="/"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
        >
          Voltar para home
        </Link>
      </div>
    );
  }

  if (!produto) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)]">
      <div className="w-full px-4 py-5 sm:px-6 md:px-8">
        <header className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-slate-100 mb-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80">
            <span className="text-2xl" aria-hidden="true">
              👕
            </span>
            <strong className="text-base font-black">Vitrine</strong>
          </Link>
          <Link
            to="/propostas"
            className="text-xs font-semibold text-slate-300 hover:text-cyan-200"
          >
            Minhas propostas
          </Link>
        </header>

        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="mb-4 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            ← Voltar
          </button>

          <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl p-6 shadow-lg">
            {/* Imagem do Produto */}
            <div className="flex flex-col gap-4">
              <div className="bg-slate-100 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
                {produto.imagemUrl ? (
                  <img
                    src={produto.imagemUrl}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-slate-400">Sem imagem disponível</p>
                )}
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">
                  {produto.nome}
                </h1>
                <p className="text-slate-600 mb-4">{produto.descricao}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-slate-600">Preço:</span>
                    <span className="text-2xl font-bold text-cyan-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(produto.preco)}
                    </span>
                  </div>
                  {produto.avaliacao && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Avaliação:</span>
                      <span className="font-semibold">
                        {produto.avaliacao.toFixed(1)} ⭐
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulário de Proposta */}
              <form onSubmit={handleEnviarProposta} className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Enviar Proposta
                </h3>

                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva seu interesse ou faça uma pergunta sobre o produto..."
                  className="w-full h-24 rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />

                {erro && (
                  <p className="text-red-600 text-sm font-semibold">{erro}</p>
                )}

                {propostaPendente && (
                  <p className="text-green-600 text-sm font-semibold">
                    ✓ Proposta enviada com sucesso!
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isEnviandoProposta}
                  className="w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition"
                >
                  {isEnviandoProposta ? "Enviando..." : "Enviar Proposta"}
                </button>
              </form>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 inline-block px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            Continuar explorando
          </Link>
        </div>
      </div>
    </div>
  );
}

