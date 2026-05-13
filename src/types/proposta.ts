export type UUID = string;

export type StatusProposta =
  | "pendente"
  | "respondida"
  | "aceita"
  | "rejeitada"
  | "cancelada";

export interface Proposta {
  id: UUID;
  produtoId: UUID;
  mensagem: string;
  status: StatusProposta;
}

export interface CriarPropostaRequest {
  produtoId: UUID;
  usuarioId: UUID;
  mensagem: string;
}

export type MinhasPropostasResponse = Proposta[];
