import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

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
    path.startsWith("/auth/") ||
    path === "/login" ||
    path === "/cadastro"
  );
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token && !ehRotaPublica(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token adicionado ao header Authorization");
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

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

  throw ultimoErro ?? new Error("Nao foi possivel conectar ao endpoint de auth.");
}