import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../Services/Api";
import CardProduto from "../components/CardProduto";
import type { ListarProdutosResponse } from "../types";
import { useAuthStore } from "../stores/authStore";

export default function Home() {
  const navigate = useNavigate();
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [somenteDestaques, setSomenteDestaques] = useState(false);
  const [status, setStatus] = useState("Conectando ao backend...");
  const [produtos, setProdutos] = useState<ListarProdutosResponse>([]);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const endpoint = somenteDestaques ? "/produtos/destaques" : "/produtos";

    api
      .get<ListarProdutosResponse>(endpoint)
      .then((res) => {
        setProdutos(res.data);
        setStatus(
          somenteDestaques
            ? `Conectado. ${res.data.length} destaque(s) recebido(s).`
            : `Conectado. ${res.data.length} produto(s) recebido(s).`,
        );
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          setStatus(
            somenteDestaques
              ? "Falha no servidor ao carregar destaques. Tente novamente."
              : "Falha no servidor ao carregar produtos. Tente novamente.",
          );
          return;
        }

        const mensagem =
          error instanceof Error ? error.message : "Erro ao conectar.";
        setStatus(
          somenteDestaques
            ? `Falha na conexão ao carregar destaques: ${mensagem}`
            : `Falha na conexão: ${mensagem}`,
        );
      });
  }, [somenteDestaques]);

  const produtosVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return produtos;
    }

    return produtos.filter((produto) => {
      const nome = produto.nome.toLowerCase();
      const descricao = (produto.descricao ?? "").toLowerCase();

      return nome.includes(termo) || descricao.includes(termo);
    });
  }, [busca, produtos]);

  function handlePesquisar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusca(buscaInput);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-slate-50 to-sky-100">
  <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    {/* Header */}
    <header className="sticky top-4 z-40 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/95 px-5 py-3.5 text-slate-100 shadow-lg shadow-slate-900/10 backdrop-blur supports-backdrop-filter:bg-slate-900/80">
      <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/15 text-xl ring-1 ring-cyan-400/30" aria-hidden="true">
          👕
        </span>
        <span className="text-base font-extrabold tracking-tight">
          Vitrine
        </span>
      </Link>

      <nav className="flex items-center gap-2">
        {token ? (
          <>
            <Link
              to="/propostas"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-white/5 hover:text-cyan-200"
            >
              Minhas propostas
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-cyan-400"
          >
            Identifique-se
          </Link>
        )}
      </nav>
    </header>

    {/* Hero */}
    <div className="mt-10 max-w-3xl">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-800 ring-1 ring-cyan-200">
        Novidades da semana
      </span>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
        Roupas em <span className="bg-linear-to-r from-cyan-600 to-sky-500 bg-clip-text text-transparent">destaque</span>
      </h1>
      <p className="mt-3 text-base text-slate-600">
        Encontre peças únicas, faça propostas e negocie direto com quem vende.
      </p>

      {!token ? (
        <p className="mt-3 text-sm text-slate-700">
          Para enviar proposta ou interagir com os itens, faça
          <Link to="/login" className="mx-1 font-semibold text-cyan-700 underline-offset-2 hover:underline">
            login
          </Link>
          ou
          <Link to="/cadastro" className="mx-1 font-semibold text-cyan-700 underline-offset-2 hover:underline">
            cadastre-se
          </Link>
          .
        </p>
      ) : null}
    </div>

    {/* Search bar */}
    <form
      onSubmit={handlePesquisar}
      className="mt-6 flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white/80 p-2.5 shadow-sm backdrop-blur md:flex-row md:items-center"
    >
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          id="busca"
          type="text"
          value={buscaInput}
          onChange={(event) => setBuscaInput(event.target.value)}
          placeholder="Modelo, marca, preço máximo ou ano"
          aria-label="Buscar roupas"
          className="h-11 w-full rounded-xl border border-transparent bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-11 flex-1 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-500 active:scale-[0.98] md:flex-none"
        >
          Pesquisar
        </button>

        <button
          type="button"
          onClick={() => setSomenteDestaques((v) => !v)}
          aria-pressed={somenteDestaques}
          className={`h-11 flex-1 rounded-xl px-5 text-sm font-bold transition active:scale-[0.98] md:flex-none ${
            somenteDestaques
              ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
              : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
          }`}
        >
          {somenteDestaques ? "★ Destaques" : "☆ Destaques"}
        </button>
      </div>
    </form>

    {/* Status / count */}
    <div className="mt-4 flex items-center justify-between">
      <p className="text-xs font-medium text-slate-500">{status}</p>
      {produtosVisiveis.length > 0 && (
        <p className="text-xs font-semibold text-slate-600">
          {produtosVisiveis.length} {produtosVisiveis.length === 1 ? "item" : "itens"}
        </p>
      )}
    </div>

    {/* Grid / empty state */}
    {!produtosVisiveis.length ? (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-2xl">
          🔍
        </div>
        <p className="mt-4 text-base font-semibold text-slate-800">
          Nenhuma roupa encontrada
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Tente ajustar a busca ou remover os filtros.
        </p>
        {somenteDestaques && (
          <button
            onClick={() => setSomenteDestaques(false)}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Exibir todos
          </button>
        )}
      </div>
    ) : (
      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {produtosVisiveis.map((produto) => (
          <CardProduto
            key={produto.id}
            produto={produto}
            detalhe="Coleção disponível"
          />
        ))}
      </section>
    )}
  </div>
</div>
  );
}