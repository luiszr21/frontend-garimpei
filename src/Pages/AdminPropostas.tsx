import { useEffect, useState } from "react";
import { api } from "../Services/Api";
import { AdminLayout } from "../components/AdminLayout";
import type { InteracaoAdmin, ListarInteracoesResponse } from "../types/admin";

export default function AdminPropostas() {
  const [interacoes, setInteracoes] = useState<InteracaoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>("pendente");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resposta, setResposta] = useState<string>("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Buscar interações
  const carregarInteracoes = async () => {
    try {
      setLoading(true);
      const res = await api.get<ListarInteracoesResponse>(
        `/admin/interacoes?status=${filtro}`
      );
      setInteracoes(res.data.interacoes);
    } catch (err) {
      setError("Erro ao carregar interações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarInteracoes();
  }, [filtro]);

  useEffect(() => {
    function onPropostasUpdated() {
      carregarInteracoes();
    }

    window.addEventListener("propostas:updated", onPropostasUpdated as EventListener);
    return () => window.removeEventListener("propostas:updated", onPropostasUpdated as EventListener);
  }, []);

  // Responder interação
  const handleResponder = async (id: string) => {
    if (!resposta.trim()) {
      setError("Digite uma resposta antes de enviar");
      return;
    }

    try {
      setEnviandoResposta(true);
      setError(null);
      setSucesso(null);

      await api.patch(`/admin/interacoes/${id}/responder`, {
        resposta: resposta.trim(),
      });

      setSucesso("Resposta enviada com sucesso!");
      setResposta("");
      setSelectedId(null);
      await carregarInteracoes();
    } catch (err) {
      setError("Erro ao enviar resposta");
    } finally {
      setEnviandoResposta(false);
    }
  };

  // Enviar email
  const handleEnviarEmail = async (id: string, email: string) => {
    try {
      setError(null);
      setSucesso(null);

      await api.post(`/admin/interacoes/${id}/enviar-email`, {
        email,
      });

      setSucesso("Email enviado com sucesso!");
      await carregarInteracoes();
    } catch (err) {
      setError("Erro ao enviar email");
    }
  };

  // Confirmar interação
  const handleConfirmar = async (id: string) => {
    try {
      setError(null);
      setSucesso(null);

      await api.patch(`/admin/interacoes/${id}/confirmar`);

      setSucesso("Interação confirmada!");
      await carregarInteracoes();
    } catch (err) {
      setError("Erro ao confirmar interação");
    }
  };

  // Excluir interação
  const handleExcluir = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta interação?"))
      return;

    try {
      setError(null);
      setSucesso(null);

      await api.delete(`/admin/interacoes/${id}`);

      setSucesso("Interação excluída com sucesso!");
      await carregarInteracoes();
    } catch (err) {
      setError("Erro ao excluir interação");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; bgColor: string; textColor: string }> = {
      pendente: { color: "warning", label: "Pendente", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
      respondida: { color: "info", label: "Respondida", bgColor: "bg-blue-100", textColor: "text-blue-800" },
      confirmada: { color: "success", label: "Confirmada", bgColor: "bg-green-100", textColor: "text-green-800" },
      excluida: { color: "danger", label: "Excluída", bgColor: "bg-red-100", textColor: "text-red-800" },
    };

    const badge = badges[status] || badges.pendente;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bgColor} ${badge.textColor}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96 text-lg text-gray-600">
          Carregando interações...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gerenciamento de Interações
          </h1>
          <p className="text-gray-600">
            Visualize, responda e gerencie as interações dos clientes
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {sucesso && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            {sucesso}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-md mb-6 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="filtro-status" className="font-medium text-gray-700">
              Filtrar por status:
            </label>
            <select
              id="filtro-status"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="pendente">Pendentes</option>
              <option value="respondida">Respondidas</option>
              <option value="confirmada">Confirmadas</option>
              <option value="excluida">Excluídas</option>
              <option value="">Todas</option>
            </select>
          </div>
          <div className="text-gray-600">
            Total: <strong className="text-gray-900">{interacoes.length}</strong>
          </div>
        </div>

        {/* Interactions List */}
        <div className="space-y-4">
          {interacoes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-md text-center text-gray-500">
              <p className="text-lg">Nenhuma interação encontrada com este filtro.</p>
            </div>
          ) : (
            interacoes.map((interacao) => (
              <div key={interacao.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Interaction Header */}
                <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {interacao.produtoNome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        De: <strong className="text-gray-800">{interacao.usuarioNome}</strong> (
                        {interacao.usuarioEmail})
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(interacao.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(interacao.criadoEm).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interaction Body */}
                <div className="p-6 space-y-4">
                  {/* Customer Message */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                      Mensagem do Cliente
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
                      {interacao.mensagem}
                    </div>
                  </div>

                  {/* Admin Response (if exists) */}
                  {interacao.resposta && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                        Sua Resposta
                      </h4>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-gray-700 whitespace-pre-wrap">
                        {interacao.resposta}
                      </div>
                      {interacao.dataResponsta && (
                        <p className="text-xs text-gray-500 mt-2">
                          Respondido em:{" "}
                          {new Date(interacao.dataResponsta).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Response Form (if selected) */}
                  {selectedId === interacao.id && (
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-blue-300">
                      <textarea
                        value={resposta}
                        onChange={(e) => setResposta(e.target.value)}
                        placeholder="Digite sua resposta aqui..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-3"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleResponder(interacao.id)}
                          disabled={enviandoResposta}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                        >
                          {enviandoResposta ? "Enviando..." : "Enviar Resposta"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedId(null);
                            setResposta("");
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex flex-wrap gap-2">
                  {interacao.status === "pendente" && (
                    <>
                      {selectedId !== interacao.id ? (
                        <button
                          onClick={() => setSelectedId(interacao.id)}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors"
                        >
                           Responder
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedId(null);
                            setResposta("");
                          }}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded transition-colors"
                        >
                           Fechar
                        </button>
                      )}
                    </>
                  )}

                  {interacao.status === "respondida" && (
                    <button
                      onClick={() => handleConfirmar(interacao.id)}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded transition-colors"
                      title="Confirmar"
                    >
                       Confirmar
                    </button>
                  )}

                  <button
                    onClick={() => handleExcluir(interacao.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded transition-colors"
                    title="Excluir"
                  >
                     Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
