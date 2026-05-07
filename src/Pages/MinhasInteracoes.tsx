import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";
import type { Proposta } from "../types/proposta";
import type { Produto } from "../types/produto";
import axios from "axios";

interface PropostaComProduto extends Proposta {
  produtoInfo?: Produto;
}

export default function MinhasInteracoes() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [propostas, setPropostas] = useState<PropostaComProduto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [deletando, setDeletando] = useState<string | null>(null);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // Buscar propostas do usuário
  useEffect(() => {
    if (!token) return;

    api
      .get<any>("/propostas/minhas")
      .then(async (res) => {
        console.log("Propostas carregadas:", res.data);
        // Backend retorna { propostas: [], paginacao: {} }
        const propostasData = Array.isArray(res.data) ? res.data : res.data.propostas || [];
        
        // Carregar detalhes de cada produto para obter a imagem
        const propostasComProduto = await Promise.all(
          propostasData.map(async (proposta: Proposta) => {
            try {
              const produtoRes = await api.get<Produto>(`/produtos/${proposta.produtoId}`);
              return {
                ...proposta,
                produtoInfo: produtoRes.data,
              };
            } catch (error) {
              console.warn(`Erro ao buscar produto ${proposta.produtoId}:`, error);
              return proposta;
            }
          })
        );
        
        setPropostas(propostasComProduto);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar propostas:", error);
        if (axios.isAxiosError(error)) {
          console.error("Status HTTP:", error.response?.status);
          console.error("Dados do erro:", error.response?.data);
          if (error.response?.status === 401) {
            navigate("/login", { replace: true });
          } else if (error.response?.status === 403) {
            // 403 Forbidden - pode ser que o endpoint não esteja implementado ou há problema de permissão
            console.error("403 Forbidden - Verificar com o backend");
            setErro("Acesso negado. Verifique com o administrador ou tente fazer login novamente.");
            setIsLoading(false);
          } else if (error.response?.status === 404) {
            // Endpoint não existe ou sem propostas
            setPropostas([]);
            setIsLoading(false);
          } else {
            setErro(`Erro ao carregar propostas. (${error.response?.status || "Desconhecido"})`);
            setIsLoading(false);
          }
        } else {
          setErro("Erro de conexão ao carregar propostas.");
          setIsLoading(false);
        }
      });
  }, [token, navigate]);

  const getStatusColor = (status: Proposta["status"]) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "aceita":
        return "bg-green-100 text-green-800";
      case "rejeitada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status: Proposta["status"]) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "aceita":
        return "Aceita";
      case "rejeitada":
        return "Rejeitada";
      default:
        return "Desconhecido";
    }
  };

  async function handleExcluirProposta(propostaId: string) {
    if (!window.confirm("Tem certeza que deseja excluir esta proposta?")) {
      return;
    }

    setDeletando(propostaId);

    try {
      await api.delete(`/propostas/${propostaId}`);
      // Remove a proposta da lista
      setPropostas(propostas.filter((p) => p.id !== propostaId));
    } catch (error) {
      console.error("Erro ao excluir proposta:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
        } else if (error.response?.status === 404) {
          setErro("Proposta não encontrada.");
        } else {
          setErro(`Erro ao excluir proposta. (${error.response?.status || "Desconhecido"})`);
        }
      } else {
        setErro("Erro ao excluir proposta.");
      }
    } finally {
      setDeletando(null);
    }
  }

  if (!token) {
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
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Explorar produtos
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="text-xs font-semibold text-red-400 hover:text-red-300"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Minhas Propostas
          </h1>
          <p className="text-slate-600 mb-6">
            Acompanhe o status de suas propostas e interações com os produtos.
          </p>

          {isLoading ? (
            <p className="text-slate-600">Carregando propostas...</p>
          ) : erro ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {erro}
            </div>
          ) : propostas.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
              <p className="text-slate-600 mb-4">
                Você ainda não enviou nenhuma proposta.
              </p>
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500"
              >
                Explorar produtos
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Mensagem
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {propostas.map((proposta) => (
                    <tr
                      key={proposta.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {proposta.produtoInfo?.imagemUrl ? (
                            <img
                              src={proposta.produtoInfo.imagemUrl}
                              alt={proposta.produtoInfo.nome}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                              Sem imagem
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {proposta.produtoInfo?.nome || "Produto"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">
                        {proposta.mensagem}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            proposta.status
                          )}`}
                        >
                          {getStatusLabel(proposta.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            to={`/produto/${proposta.produtoId}`}
                            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 underline"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleExcluirProposta(proposta.id)}
                            disabled={deletando === proposta.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50 transition text-lg"
                            title="Excluir proposta"
                          >
                            {deletando === proposta.id ? "⏳" : "🗑️"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link
            to="/"
            className="mt-6 inline-block px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            ← Voltar para home
          </Link>
        </div>
      </div>
    </div>
  );
}
