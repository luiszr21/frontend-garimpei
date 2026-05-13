import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { useAuthStore } from "../stores/authStore";

export const api = axios.create({
  baseURL: "http://localhost:3001"
});

function extrairPath(url?: string): string {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  return url;
}

function ehRotaPublica(url?: string): boolean {
  const path = extrairPath(url);

  return (
    path.startsWith("/produtos") ||
    path === "/auth/login" ||
    path === "/auth/admin/login" ||
    path === "/auth/cadastro" ||
    path === "/login" ||
    path === "/cadastro"
  );
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token && !ehRotaPublica(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Remover qualquer header Authorization existente se não houver token
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url;
    const ehProtegida = !ehRotaPublica(url);

    if (status === 401 && ehProtegida) {
      useAuthStore.getState().logout();

      const pathAtual = window.location.pathname;
      const rotaAuth = pathAtual === "/login" || pathAtual === "/cadastro";

      if (!rotaAuth) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

function normalizarPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function postAuth<TResponse = unknown>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TResponse>> {
  const pathNormalizado = normalizarPath(path);
  const candidatos = [`/auth${pathNormalizado}`, pathNormalizado];

  let ultimoErro: unknown;

  for (const url of candidatos) {
    try {
      return await api.post<TResponse>(url, data, config);
    } catch (erro) {
      if (axios.isAxiosError(erro) && erro.response?.status !== 404) {
        throw erro;
      }

      ultimoErro = erro;
    }
  }

  throw ultimoErro ?? new Error("Não foi possível conectar ao endpoint de auth.");
}