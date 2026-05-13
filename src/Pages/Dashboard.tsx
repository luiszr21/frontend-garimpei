import { useEffect, useState } from "react";
import { api } from "../Services/Api";
import { AdminLayout } from "../components/AdminLayout";
import { StatsCard } from "../components/StatsCard";
import { VictoryPie } from "victory";
import type { DashboardStats } from "../types/admin";

function getDashboardStats(): Promise<DashboardStats> {
  return api
    .get<DashboardStats>("/admin/dashboard/stats")
    .then((res) => res.data)
    .catch(() => ({
      totalProdutos: 0,
      totalInteracoes: 0,
      interacoesRespondidas: 0,
      interacoesPendentes: 0,
      totalUsuarios: 0,
      taxaRespostaPorcentagem: 0,
    }));
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProdutos: 0,
    totalInteracoes: 0,
    interacoesRespondidas: 0,
    interacoesPendentes: 0,
    totalUsuarios: 0,
    taxaRespostaPorcentagem: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96 text-lg text-gray-600">
          Carregando dashboard...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <StatsCard
            title="Total de Produtos"
            value={stats.totalProdutos}
            icon="📦"
            color="blue"
          />
          <StatsCard
            title="Total de Interações"
            value={stats.totalInteracoes}
            icon="💬"
            color="green"
          />
          <StatsCard
            title="Interações Respondidas"
            value={stats.interacoesRespondidas}
            icon="✅"
            color="green"
          />
          <StatsCard
            title="Interações Pendentes"
            value={stats.interacoesPendentes}
            icon="⏳"
            color="yellow"
          />
          <StatsCard
            title="Total de Usuários"
            value={stats.totalUsuarios}
            icon="👥"
            color="purple"
          />
          <StatsCard
            title="Taxa de Resposta"
            value={`${stats.taxaRespostaPorcentagem}%`}
            icon="📊"
            color="blue"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Distribuição de Interações */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição de Interações
            </h2>
            <div className="flex justify-center">
              <svg viewBox="0 0 400 400" className="w-full max-w-xs h-auto">
                <VictoryPie
                  data={[
                    {
                      x: "Respondidas",
                      y: stats.interacoesRespondidas,
                      fill: "#10b981",
                    },
                    {
                      x: "Pendentes",
                      y: stats.interacoesPendentes,
                      fill: "#f59e0b",
                    },
                  ]}
                  innerRadius={60}
                  labels={({ datum }) => `${datum.x}: ${datum.y}`}
                  style={{
                    labels: {
                      fill: "#374151",
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
                  colorScale={["#10b981", "#f59e0b"]}
                  width={400}
                  height={280}
                />
              </svg>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                <span className="text-sm text-gray-600">Respondidas: {stats.interacoesRespondidas}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-yellow-500"></span>
                <span className="text-sm text-gray-600">Pendentes: {stats.interacoesPendentes}</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Taxa de Resposta */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Taxa de Resposta do Sistema
            </h2>
            <div className="flex justify-center">
              <svg viewBox="0 0 400 400" className="w-full max-w-xs h-auto">
                <VictoryPie
                  data={[
                    {
                      x: "Respondidas",
                      y: stats.taxaRespostaPorcentagem,
                      fill: "#3b82f6",
                    },
                    {
                      x: "Não Respondidas",
                      y: 100 - stats.taxaRespostaPorcentagem,
                      fill: "#e5e7eb",
                    },
                  ]}
                  innerRadius={60}
                  labels={({ datum }) => `${datum.x}: ${datum.y}%`}
                  style={{
                    labels: {
                      fill: "#374151",
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
                  colorScale={["#3b82f6", "#e5e7eb"]}
                  width={400}
                  height={280}
                />
              </svg>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-blue-500"></span>
                <span className="text-sm text-gray-600">Taxa: {stats.taxaRespostaPorcentagem}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded bg-gray-300"></span>
                <span className="text-sm text-gray-600">Restante: {100 - stats.taxaRespostaPorcentagem}%</span>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo Rápido
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <span className="text-sm text-gray-600">📦 Produtos</span>
                <strong className="text-xl text-gray-900">{stats.totalProdutos}</strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                <span className="text-sm text-gray-600">👥 Usuários</span>
                <strong className="text-xl text-gray-900">{stats.totalUsuarios}</strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-cyan-500">
                <span className="text-sm text-gray-600">💬 Interações</span>
                <strong className="text-xl text-gray-900">{stats.totalInteracoes}</strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                <span className="text-sm text-gray-600">✅ Respondidas</span>
                <strong className="text-xl text-gray-900">{stats.interacoesRespondidas}</strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
                <span className="text-sm text-gray-600">⏳ Pendentes</span>
                <strong className="text-xl text-gray-900">{stats.interacoesPendentes}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
