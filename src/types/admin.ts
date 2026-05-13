export interface DashboardStats {
  totalProdutos: number;
  totalInteracoes: number;
  interacoesRespondidas: number;
  interacoesPendentes: number;
  totalUsuarios: number;
  taxaRespostaPorcentagem: number;
}

export interface InteracaoAdmin {
  id: string;
  produtoId: string;
  produtoNome: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  mensagem: string;
  status: "pendente" | "respondida" | "confirmada" | "excluida";
  resposta?: string | null;
  dataResponsta?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ListarInteracoesResponse {
  interacoes: InteracaoAdmin[];
  total: number;
  pagina: number;
  porPagina: number;
}
