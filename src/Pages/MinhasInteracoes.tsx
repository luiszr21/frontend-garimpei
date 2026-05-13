import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../Services/Api";
import type { MinhasPropostasResponse, Produto, Proposta } from "../types";

type PropostasApiResponse = MinhasPropostasResponse | { propostas: MinhasPropostasResponse };

function extrairListaPropostas(data: PropostasApiResponse): MinhasPropostasResponse {
	if (Array.isArray(data)) {
		return data;
	}

	return data.propostas ?? [];
}

async function buscarMinhasPropostas(): Promise<MinhasPropostasResponse> {
	const res = await api.get<PropostasApiResponse>("/propostas/minhas");
	return extrairListaPropostas(res.data);
}

async function atualizarProposta(id: string, mensagem: string): Promise<void> {
	await api.patch(`/propostas/${id}`, { mensagem });
}

async function excluirProposta(id: string): Promise<void> {
	await api.delete(`/propostas/${id}`);
}

export default function MinhasInteracoes() {
	const [propostas, setPropostas] = useState<MinhasPropostasResponse>([]);
	const [produtos, setProdutos] = useState<Produto[]>([]);
	const [status, setStatus] = useState("Carregando suas propostas...");
	const [mensagensEditadas, setMensagensEditadas] = useState<Record<string, string>>({});
	const [idProcessando, setIdProcessando] = useState<string | null>(null);

	useEffect(() => {
		Promise.all([
			buscarMinhasPropostas(),
			api.get<Produto[]>("/produtos").then((res) => res.data).catch(() => []),
		])
			.then(([listaPropostas, listaProdutos]) => {
				setPropostas(listaPropostas);
				setProdutos(listaProdutos);
				setStatus(`Você possui ${listaPropostas.length} proposta(s).`);
			})
			.catch(() => {
				setStatus("Falha ao carregar propostas. Tente novamente.");
			});
	}, []);

	const produtoPorId = useMemo(() => {
		return new Map(produtos.map((produto) => [produto.id, produto]));
	}, [produtos]);

	function getMensagemAtual(proposta: Proposta): string {
		return mensagensEditadas[proposta.id] ?? proposta.mensagem;
	}

	async function handleSalvarAlteracao(proposta: Proposta) {
		const mensagemAtual = getMensagemAtual(proposta).trim();

		if (!mensagemAtual) {
			setStatus("A mensagem da proposta não pode ficar vazia.");
			return;
		}

		setIdProcessando(proposta.id);
		setStatus("Salvando alteração...");

		try {
			await atualizarProposta(proposta.id, mensagemAtual);
			setPropostas((estadoAtual) =>
				estadoAtual.map((item) =>
					item.id === proposta.id ? { ...item, mensagem: mensagemAtual } : item,
				),
			);
			setStatus("Proposta alterada com sucesso.");
		} catch {
			setStatus("Não foi possível alterar a proposta.");
		} finally {
			setIdProcessando(null);
		}
	}

	async function handleDesfazer(proposta: Proposta) {
		setIdProcessando(proposta.id);
		setStatus("Desfazendo proposta...");

		try {
			await excluirProposta(proposta.id);
			setPropostas((estadoAtual) => estadoAtual.filter((item) => item.id !== proposta.id));
			setStatus("Proposta desfeita com sucesso.");
		} catch {
			setStatus("Não foi possível desfazer a proposta.");
		} finally {
			setIdProcessando(null);
		}
	}

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f0e7_0%,#e7ecf1_45%,#d8e3ec_100%)]">
			<div className="w-full px-4 py-5 sm:px-6 md:px-8">
				<header className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-slate-100">
					<div className="flex items-center gap-3">
						<span className="text-2xl" aria-hidden="true">🧾</span>
						<strong className="text-base font-black">Minhas propostas</strong>
					</div>
					<Link to="/cliente" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
						Voltar para vitrine
					</Link>
				</header>

				<p className="mt-4 text-sm text-slate-700">{status}</p>

				{!propostas.length ? (
					<p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
						Você ainda não fez propostas.
					</p>
				) : (
					<section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{propostas.map((proposta) => {
							const produto = produtoPorId.get(proposta.produtoId);
							const processando = idProcessando === proposta.id;

							return (
								<article key={proposta.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
									<h2 className="text-lg font-black text-slate-900">
										{produto?.nome ?? `Produto ${proposta.produtoId}`}
									</h2>
									<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
										Status: {proposta.status}
									</p>
									<p className="mt-2 text-sm text-slate-700">
										<strong>Tamanho:</strong> {produto?.tamanho ?? "Não informado"}
									</p>
									<p className="mt-1 text-sm text-slate-700">
										<strong>Descrição:</strong> {produto?.descricao ?? "Sem descrição"}
									</p>

									<label htmlFor={`mensagem-${proposta.id}`} className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">
										Sua mensagem
									</label>
									<textarea
										id={`mensagem-${proposta.id}`}
										rows={4}
										value={getMensagemAtual(proposta)}
										onChange={(event) =>
											setMensagensEditadas((estadoAtual) => ({
												...estadoAtual,
												[proposta.id]: event.target.value,
											}))
										}
										className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
									/>

									<div className="mt-3 flex items-center gap-2">
										<button
											type="button"
											onClick={() => handleSalvarAlteracao(proposta)}
											disabled={processando}
											className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{processando ? "Salvando..." : "Alterar proposta"}
										</button>
										<button
											type="button"
											onClick={() => handleDesfazer(proposta)}
											disabled={processando}
											className="rounded-md bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Desfazer proposta
										</button>
									</div>
								</article>
							);
						})}
					</section>
				)}
			</div>
		</div>
	);
}
