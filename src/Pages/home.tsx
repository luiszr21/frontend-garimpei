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

  useEffect(() => {
    function onProdutosUpdated() {
      const endpoint = somenteDestaques ? "/produtos/destaques" : "/produtos";
      api.get<ListarProdutosResponse>(endpoint).then((res) => setProdutos(res.data)).catch(() => {});
    }

    window.addEventListener("produtos:updated", onProdutosUpdated as EventListener);
    return () => window.removeEventListener("produtos:updated", onProdutosUpdated as EventListener);
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
  <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #f8fafc 40%, #e8f4fd 100%)" }}>
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}
      <header className="sticky top-4 z-40 flex items-center justify-between rounded-2xl border border-emerald-400/10 bg-emerald-950/80 px-5 py-3 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
          <span className="text-sm font-bold tracking-widest text-white uppercase">
            Garimpei
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          {token ? (
            <>
              <Link
                to="/propostas"
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-500/10 hover:text-gray-200"
              >
                Minhas propostas
              </Link>
              <div className="mx-1 h-4 w-px bg-white/10" />
              <button
                onClick={() => { logout(); navigate("/login", { replace: true }); }}
                className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #0891b2, #0284c7)" }}
            >
              Identifique-se
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <div className="mt-12 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-700">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Novidades da semana
        </span>

        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
          Roupas em{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #0891b2 0%, #0284c7 60%, #38bdf8 100%)" }}
          >
            destaque
          </span>
        </h1>

        <p className="mt-3.5 text-base leading-relaxed text-slate-500">
          Encontre peças únicas, faça propostas e negocie direto com quem vende.
        </p>

        {!token && (
          <p className="mt-3 text-sm text-slate-500">
            Para enviar proposta ou interagir com os itens, faça{" "}
            <Link to="/login" className="font-semibold text-cyan-600 underline underline-offset-2 hover:text-cyan-700">
              login
            </Link>{" "}
            ou{" "}
            <Link to="/cadastro" className="font-semibold text-cyan-600 underline underline-offset-2 hover:text-cyan-700">
              cadastre-se
            </Link>
            .
          </p>
        )}
      </div>

      {/* Search bar */}
      <form
        onSubmit={handlePesquisar}
        className="mt-8 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:flex-row md:items-center"
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
            onChange={(e) => setBuscaInput(e.target.value)}
            placeholder="Modelo, marca, preço máximo ou ano"
            aria-label="Buscar roupas"
            className="h-11 w-full rounded-xl border border-transparent bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="h-11 flex-1 rounded-xl px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] md:flex-none"
            style={{ background: "linear-gradient(135deg, #0891b2, #0284c7)" }}
          >
            Pesquisar
          </button>

          <button
            type="button"
            onClick={() => setSomenteDestaques((v) => !v)}
            aria-pressed={somenteDestaques}
            className={`h-11 flex-1 rounded-xl px-5 text-sm font-bold transition active:scale-[0.98] md:flex-none ${
              somenteDestaques
                ? "bg-amber-400 text-slate-900 shadow-sm hover:bg-amber-300"
                : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200"
            }`}
          >
            {somenteDestaques ? "★ Destaques" : "☆ Destaques"}
          </button>
        </div>
      </form>

      {/* Status / count */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">{status}</p>
        {produtosVisiveis.length > 0 && (
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {produtosVisiveis.length} {produtosVisiveis.length === 1 ? "item" : "itens"}
          </p>
        )}
      </div>

      {/* Grid / empty state */}
      {!produtosVisiveis.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl"
            style={{ background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)" }}
          >
            🔍
          </div>
          <p className="mt-4 text-base font-semibold text-slate-700">
            Nenhuma roupa encontrada
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Tente ajustar a busca ou remover os filtros.
          </p>
          {somenteDestaques && (
            <button
              onClick={() => setSomenteDestaques(false)}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
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