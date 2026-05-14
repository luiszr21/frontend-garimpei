export type UUID = string;

export interface Usuario {
  id: UUID;
  nome: string;
  email: string;
  role?: "user" | "admin";
  tipo?: "user" | "admin";
}