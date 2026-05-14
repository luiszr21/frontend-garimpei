import type { Usuario } from "./usuario";

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  // Backend returns `user` object; keep `usuario` for compatibility
  user?: Usuario;
  usuario?: Usuario;
}